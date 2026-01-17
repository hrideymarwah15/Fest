import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Admin API for getting all registrations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.email !== "admin@sportsfest.com")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get("sportId");
    const collegeId = searchParams.get("collegeId");
    const status = searchParams.get("status");

    const registrations = await db.registration.findMany({
      where: {
        ...(sportId && { sportId }),
        ...(collegeId && { collegeId }),
        ...(status && { status: status as any }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        sport: true,
        college: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { message: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
