import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateAdminAccess, sportCreationSchema, sanitizeInput } from "@/lib/security";

// GET all sports (admin)
export async function GET(req: NextRequest) {
  try {
    await validateAdminAccess();

    const sports = await db.sport.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { name: "asc" },
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

// POST create a new sport
export async function POST(req: NextRequest) {
  try {
    await validateAdminAccess();

    const body = await req.json();
    const validatedData = sportCreationSchema.parse(body);

    const {
      name,
      slug,
      description,
      type,
      minTeamSize,
      rules,
      fee,
      maxSlots,
      image,
      venue,
    } = validatedData;

    // Check if slug already exists
    const existingSport = await db.sport.findUnique({
      where: { slug },
    });

    if (existingSport) {
      return NextResponse.json(
        { message: "Sport with this slug already exists" },
        { status: 400 }
      );
    }

    const sport = await db.sport.create({
      data: {
        name: sanitizeInput(name),
        slug: sanitizeInput(slug),
        description: sanitizeInput(description),
        type,
        minTeamSize: minTeamSize || 1,
        maxTeamSize: minTeamSize || 1, // For individual sports, max = min
        rules: rules || [],
        fee,
        maxSlots,
        imageUrl: image || null,
        venue: venue ? sanitizeInput(venue) : null,
        isActive: true,
        registrationOpen: true,
      },
    });

    return NextResponse.json(sport, { status: 201 });
  } catch (error) {
    console.error("Error creating sport:", error);
    return NextResponse.json(
      { message: "Failed to create sport" },
      { status: 500 }
    );
  }
}
