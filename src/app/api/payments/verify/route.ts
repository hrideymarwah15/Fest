import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { badRequestResponse, notFoundResponse, serverErrorResponse } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return badRequestResponse("Invalid payment signature");
    }

    // Use transaction for atomic updates and idempotency
    const payment = await db.$transaction(async (tx) => {
      // Check if payment is already processed (idempotency)
      const existingPayment = await tx.payment.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (existingPayment && existingPayment.status === "SUCCESS") {
        // Already processed, return existing data
        return tx.payment.findUnique({
          where: { razorpayOrderId: razorpay_order_id },
          include: {
            registration: {
              include: { sport: true },
            },
          },
        });
      }

      // Update payment record
      const updatedPayment = await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "SUCCESS",
        },
        include: {
          registration: {
            include: { sport: true },
          },
        },
      });

      // Update registration status
      await tx.registration.update({
        where: { id: updatedPayment.registrationId },
        data: { status: "CONFIRMED" },
      });

      // Note: Slots were already incremented during registration creation
      // This ensures we don't double-count slots

      return updatedPayment;
    });

    if (!payment) {
      return notFoundResponse("Payment");
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      registrationId: payment.registrationId,
    });
  } catch {
    return serverErrorResponse("Payment verification failed");
  }
}
