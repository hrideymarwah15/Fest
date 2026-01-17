import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import { logTransaction } from "@/lib/logger";
import { z } from "zod";

const completePendingSchema = z.object({
    registrationId: z.string().cuid(),
});

/**
 * POST /api/payments/complete-pending
 * 
 * Creates a new Razorpay order for completing a pending payment.
 * Used when user wants to pay for a registration that was created without immediate payment.
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
        const { registrationId } = completePendingSchema.parse(body);

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
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if registration is pending
        if (registration.status !== "PENDING") {
            return NextResponse.json(
                { message: "Registration is not pending payment" },
                { status: 400 }
            );
        }

        // Check if payment already exists
        if (registration.payment) {
            // If payment exists but is pending, create a new order
            if (registration.payment.status === "PENDING") {
                // Create new Razorpay order
                const order = await createRazorpayOrder({
                    amount: registration.sport.fee,
                    receipt: `reg_${registration.id}`,
                    notes: {
                        registrationId: registration.id,
                        sportId: registration.sport.id,
                        sportName: registration.sport.name,
                        userId: session.user.id,
                    },
                });

                // Update payment record with new order
                await db.payment.update({
                    where: { id: registration.payment.id },
                    data: {
                        razorpayOrderId: order.id,
                        updatedAt: new Date(),
                    },
                });

                return NextResponse.json({
                    registrationId: registration.id,
                    orderId: order.id,
                    amount: registration.sport.fee,
                    currency: "INR",
                    keyId: process.env.RAZORPAY_KEY_ID,
                });
            } else {
                return NextResponse.json(
                    { message: "Payment already completed" },
                    { status: 400 }
                );
            }
        }

        // Create new payment record if it doesn't exist
        const order = await createRazorpayOrder({
            amount: registration.sport.fee,
            receipt: `reg_${registration.id}`,
            notes: {
                registrationId: registration.id,
                sportId: registration.sport.id,
                sportName: registration.sport.name,
                userId: session.user.id,
            },
        });

        await db.payment.create({
            data: {
                registrationId: registration.id,
                razorpayOrderId: order.id,
                amount: registration.sport.fee,
                status: "PENDING",
            },
        });

        // Log the transaction
        await logTransaction(
            "PAYMENT_CREATED",
            "PAYMENT",
            registration.id,
            session.user.id,
            {
                sportId: registration.sport.id,
                amount: registration.sport.fee,
                orderId: order.id,
            }
        );

        return NextResponse.json({
            registrationId: registration.id,
            orderId: order.id,
            amount: registration.sport.fee,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Complete pending payment error:", error);
        return NextResponse.json(
            { message: "Failed to create payment order" },
            { status: 500 }
        );
    }
}
