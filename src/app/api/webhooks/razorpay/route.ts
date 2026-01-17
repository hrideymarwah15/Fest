import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { logTransaction } from "@/lib/logger";

// Razorpay webhook handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "payment.captured": {
        const paymentEntity = event.payload.payment.entity;

        // Use transaction for atomic updates and idempotency
        await db.$transaction(async (tx) => {
          // Check if payment is already processed (idempotency)
          const existingPayment = await tx.payment.findUnique({
            where: { razorpayOrderId: paymentEntity.order_id },
          });

          if (existingPayment && existingPayment.status === "SUCCESS") {
            // Already processed, skip to prevent duplicate processing
            return;
          }

          // Update payment status
          const payment = await tx.payment.update({
            where: { razorpayOrderId: paymentEntity.order_id },
            data: {
              razorpayPaymentId: paymentEntity.id,
              razorpaySignature: event.payload.payment.entity.signature,
              status: "SUCCESS",
            },
            include: { registration: true },
          });

          if (payment) {
            // Update registration status
            await tx.registration.update({
              where: { id: payment.registrationId },
              data: { status: "CONFIRMED" },
            });

            // Log successful payment
            await logTransaction(
              "PAYMENT_SUCCESS",
              "PAYMENT",
              payment.id,
              payment.registration.userId,
              {
                razorpayPaymentId: paymentEntity.id,
                amount: payment.amount,
                registrationId: payment.registrationId,
              }
            );

            // Note: Slots were already incremented during registration creation
            // This ensures we don't double-count slots
          }
        });
        break;
      }

      case "payment.failed": {
        const paymentEntity = event.payload.payment.entity;

        // Use transaction to atomically update payment, registration, and release slot
        await db.$transaction(async (tx) => {
          // Update payment status
          const payment = await tx.payment.update({
            where: { razorpayOrderId: paymentEntity.order_id },
            data: {
              razorpayPaymentId: paymentEntity.id,
              status: "FAILED",
            },
            include: { registration: { include: { sport: true } } },
          });

          // Cancel registration
          await tx.registration.update({
            where: { id: payment.registrationId },
            data: { status: "CANCELLED" },
          });

          // Release the reserved slot
          await tx.sport.update({
            where: { id: payment.registration.sportId },
            data: { filledSlots: { decrement: 1 } },
          });

          // Log failed payment with slot release
          await logTransaction(
            "PAYMENT_FAILED",
            "PAYMENT",
            payment.id,
            payment.registration.userId,
            {
              razorpayPaymentId: paymentEntity.id,
              amount: payment.amount,
              registrationId: payment.registrationId,
              slotReleased: true,
            }
          );
        });
        break;
      }

      case "refund.created": {
        const refundEntity = event.payload.refund.entity;

        // Find payment by razorpayPaymentId (not unique, so use findFirst)
        const payment = await db.payment.findFirst({
          where: { razorpayPaymentId: refundEntity.payment_id },
        });

        if (payment) {
          // Update payment status
          await db.payment.update({
            where: { id: payment.id },
            data: { status: "REFUNDED" },
          });

          // Update registration status
          await db.registration.update({
            where: { id: payment.registrationId },
            data: { status: "CANCELLED" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
