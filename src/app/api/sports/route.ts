import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Dynamic import to ensure proper initialization on Vercel
    const { db } = await import("@/lib/db");
    
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
    return NextResponse.json(
      { error: "Failed to fetch sports", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
