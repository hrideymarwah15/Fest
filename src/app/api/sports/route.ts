import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sports = await db.sport.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        minTeamSize: true,
        maxTeamSize: true,
        maxSlots: true,
        filledSlots: true,
        fee: true,
        imageUrl: true,
        registrationOpen: true,
        eventDate: true,
        venue: true,
      },
    });

    return NextResponse.json(sports);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { message: "Failed to fetch sports" },
      { status: 500 }
    );
  }
}
