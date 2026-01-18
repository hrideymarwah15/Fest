import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/security";
import { logTransaction } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // Add authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return badRequestResponse("Missing required payment parameters");
    }

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
        include: {
          registration: {
            include: { sport: true },
          },
        },
      });

      if (!existingPayment) {
        throw new Error("Payment not found");
      }

      // Verify the payment belongs to the current user
      if (existingPayment.registration.userId !== session.user.id) {
        throw new Error("Unauthorized - Payment does not belong to user");
      }

      if (existingPayment.status === "SUCCESS") {
        // Already processed, return existing data
        return existingPayment;
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

    // Log the payment verification
    await logTransaction(
      "PAYMENT_VERIFIED",
      "PAYMENT",
      payment.id,
      session.user.id,
      {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: payment.amount,
        registrationId: payment.registrationId,
      }
    );

    return NextResponse.json({
      message: "Payment verified successfully",
      registrationId: payment.registrationId,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Payment not found") {
        return notFoundResponse("Payment");
      }
      if (error.message.startsWith("Unauthorized")) {
        return unauthorizedResponse();
      }
    }
    console.error("Payment verification failed:", error);
    return serverErrorResponse("Payment verification failed");
  }
}
