import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serverErrorResponse } from "@/lib/security";

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
        gender: true,
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

    // Convert dates to ISO strings for safe serialization
    const serializedSports = sports.map(sport => ({
      ...sport,
      eventDate: sport.eventDate ? sport.eventDate.toISOString() : null,
    }));

    return NextResponse.json(serializedSports);
  } catch (error) {
    console.error("Failed to fetch sports:", error);
    return serverErrorResponse("Failed to fetch sports. Please check database connection.");
  }
}
