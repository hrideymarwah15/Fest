import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/security";
import { logTransaction } from "@/lib/logger";

// DELETE cancel registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    // Get registration details before deletion
    const registration = await db.registration.findUnique({
      where: { id },
      include: {
        sport: true,
        payment: true,
        user: { select: { id: true, email: true } },
      },
    });

    if (!registration) {
      return notFoundResponse("Registration");
    }

    // Delete the registration and related payment, release slot
    await db.$transaction(async (tx) => {
      // Delete payment if exists
      if (registration.payment) {
        await tx.payment.delete({
          where: { id: registration.payment.id },
        });
      }

      // Delete registration
      await tx.registration.delete({
        where: { id },
      });

      // Release the slot if registration was not already cancelled
      if (registration.status !== "CANCELLED") {
        await tx.sport.update({
          where: { id: registration.sportId },
          data: { filledSlots: { decrement: 1 } },
        });
      }
    });

    // Log the admin action
    await logTransaction(
      "REGISTRATION_DELETED_BY_ADMIN",
      "REGISTRATION",
      id,
      session.user.id,
      {
        deletedRegistration: {
          sportId: registration.sportId,
          sportName: registration.sport.name,
          userId: registration.userId,
          userEmail: registration.user.email,
          status: registration.status,
        },
        adminEmail: session.user.email,
      }
    );

    return NextResponse.json({
      message: "Registration cancelled successfully",
      registration,
    });
  } catch (error) {
    console.error("Failed to cancel registration:", error);
    return serverErrorResponse("Failed to cancel registration");
  }
}
