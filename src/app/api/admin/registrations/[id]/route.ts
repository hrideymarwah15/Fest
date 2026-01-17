import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE cancel registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get registration details before deletion
    const registration = await db.registration.findUnique({
      where: { id },
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

    // Delete the registration and related payment
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
    });

    return NextResponse.json({
      message: "Registration cancelled successfully",
      registration,
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { message: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
