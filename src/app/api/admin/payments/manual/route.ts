import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logTransaction } from "@/lib/logger";
import { z } from "zod";

const manualPaymentSchema = z.object({
    registrationId: z.string().cuid(),
    amount: z.number().min(0),
    paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "UPI", "OTHER"]),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/admin/payments/manual
 * 
 * Admin-only endpoint to manually confirm offline payments.
 * Creates an audit trail with isManual flag.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Verify admin access
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.email !== "admin@sportsfest.com")) {
            return NextResponse.json(
                { message: "Unauthorized - Admin access required" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validatedData = manualPaymentSchema.parse(body);

        // Fetch registration with existing payment
        const registration = await db.registration.findUnique({
            where: { id: validatedData.registrationId },
            include: {
                sport: true,
                payment: true,
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!registration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            );
        }

        // Check if already confirmed
        if (registration.status === "CONFIRMED") {
            return NextResponse.json(
                { message: "Registration is already confirmed" },
                { status: 400 }
            );
        }

        // Use transaction for atomic updates
        const result = await db.$transaction(async (tx) => {
            // Create or update payment record
            let payment;

            if (registration.payment) {
                // Update existing payment
                payment = await tx.payment.update({
                    where: { id: registration.payment.id },
                    data: {
                        amount: validatedData.amount,
                        status: "SUCCESS",
                        razorpayPaymentId: `MANUAL_${validatedData.paymentMethod}_${Date.now()}`,
                        razorpaySignature: `MANUAL_BY_${session.user.id}`,
                    },
                });
            } else {
                // Create new payment record
                payment = await tx.payment.create({
                    data: {
                        registrationId: registration.id,
                        razorpayOrderId: `MANUAL_${Date.now()}`,
                        razorpayPaymentId: `MANUAL_${validatedData.paymentMethod}_${Date.now()}`,
                        razorpaySignature: `MANUAL_BY_${session.user.id}`,
                        amount: validatedData.amount,
                        status: "SUCCESS",
                    },
                });
            }

            // Update registration status
            await tx.registration.update({
                where: { id: registration.id },
                data: { status: "CONFIRMED" },
            });

            return payment;
        });

        // Log the manual payment with full audit trail
        await logTransaction(
            "MANUAL_PAYMENT_CONFIRMED",
            "PAYMENT",
            result.id,
            registration.user.id,
            {
                confirmedBy: session.user.id,
                confirmedByEmail: session.user.email,
                registrationId: registration.id,
                sportId: registration.sport.id,
                sportName: registration.sport.name,
                amount: validatedData.amount,
                paymentMethod: validatedData.paymentMethod,
                referenceNumber: validatedData.referenceNumber || null,
                notes: validatedData.notes || null,
                isManual: true,
                timestamp: new Date().toISOString(),
            }
        );

        return NextResponse.json({
            message: "Payment confirmed successfully",
            registration: {
                id: registration.id,
                status: "CONFIRMED",
                user: registration.user,
                sport: registration.sport.name,
            },
            payment: {
                id: result.id,
                amount: validatedData.amount,
                method: validatedData.paymentMethod,
                isManual: true,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Manual payment error:", error);
        return NextResponse.json(
            { message: "Failed to confirm manual payment" },
            { status: 500 }
        );
    }
}
