import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get user registrations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const registrations = await db.registration.findMany({
      where: { userId: session.user.id },
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            imageUrl: true,
            venue: true,
            eventDate: true,
          },
        },
        college: {
          select: {
            name: true,
            code: true,
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
            razorpayPaymentId: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    return NextResponse.json(
      { message: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
