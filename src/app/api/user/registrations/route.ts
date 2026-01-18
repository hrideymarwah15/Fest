import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/security";

// Get user registrations
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
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
  } catch {
    return serverErrorResponse("Failed to fetch registrations");
  }
}
