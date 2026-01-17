import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import { logTransaction } from "@/lib/logger";
import { z } from "zod";

const createOrderSchema = z.object({
    registrationId: z.string().cuid(),
});

/**
 * POST /api/payments/create-order
 * 
 * Creates a new Razorpay order for payment retry scenarios.
 * Used when initial payment failed and user wants to retry.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { registrationId } = createOrderSchema.parse(body);

        // Fetch registration with payment info
        const registration = await db.registration.findUnique({
            where: { id: registrationId },
            include: {
                sport: true,
                payment: true,
            },
        });

        if (!registration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            );
        }

        // Security: Verify the registration belongs to the current user
        if (registration.userId !== session.user.id) {
            return NextResponse.json(
                { message: "Unauthorized - Registration does not belong to you" },
                { status: 403 }
            );
        }

        // Only allow order creation for PENDING registrations
        if (registration.status !== "PENDING") {
            return NextResponse.json(
                { message: `Cannot create order for ${registration.status} registration` },
                { status: 400 }
            );
        }

        // Check existing payment status
        const existingPayment = registration.payment;

        // If there's already a SUCCESS payment, don't allow new order
        if (existingPayment?.status === "SUCCESS") {
            return NextResponse.json(
                { message: "Payment already completed for this registration" },
                { status: 400 }
            );
        }

        // If there's a PENDING payment with valid order, return existing order
        if (existingPayment?.status === "PENDING" && existingPayment.razorpayOrderId) {
            return NextResponse.json({
                registrationId: registration.id,
                orderId: existingPayment.razorpayOrderId,
                amount: registration.sport.fee,
                currency: "INR",
                keyId: process.env.RAZORPAY_KEY_ID,
                isExisting: true,
            });
        }

        // Create new Razorpay order for retry scenario
        const order = await createRazorpayOrder({
            amount: registration.sport.fee,
            receipt: `reg_${registration.id}_retry_${Date.now()}`,
            notes: {
                registrationId: registration.id,
                sportId: registration.sport.id,
                sportName: registration.sport.name,
                userId: session.user.id,
                isRetry: "true",
            },
        });

        // Update or create payment record
        if (existingPayment) {
            // Update existing failed/pending payment
            await db.payment.update({
                where: { id: existingPayment.id },
                data: {
                    razorpayOrderId: order.id,
                    status: "PENDING",
                    razorpayPaymentId: null,
                    razorpaySignature: null,
                },
            });
        } else {
            // Create new payment record
            await db.payment.create({
                data: {
                    registrationId: registration.id,
                    razorpayOrderId: order.id,
                    amount: registration.sport.fee,
                    status: "PENDING",
                },
            });
        }

        // Log the order creation
        await logTransaction(
            "PAYMENT_ORDER_CREATED",
            "PAYMENT",
            order.id,
            session.user.id,
            {
                registrationId: registration.id,
                sportId: registration.sport.id,
                amount: registration.sport.fee,
                isRetry: !!existingPayment,
            }
        );

        return NextResponse.json({
            registrationId: registration.id,
            orderId: order.id,
            amount: registration.sport.fee,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            isExisting: false,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Create order error:", error);
        return NextResponse.json(
            { message: "Failed to create payment order" },
            { status: 500 }
        );
    }
}
