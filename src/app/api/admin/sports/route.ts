import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateAdminAccess, sportCreationSchema, sanitizeInput, badRequestResponse, serverErrorResponse } from "@/lib/security";

// GET all sports (admin)
export async function GET() {
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
  } catch {
    return serverErrorResponse("Failed to fetch sports");
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
      gender,
      maxTeamSize,
    } = validatedData;

    // Check if slug already exists
    const existingSport = await db.sport.findUnique({
      where: { slug },
    });

    if (existingSport) {
      return badRequestResponse("Sport with this slug already exists");
    }

    const sport = await db.sport.create({
      data: {
        name: sanitizeInput(name),
        slug: sanitizeInput(slug),
        description: sanitizeInput(description),
        type,
        gender: gender || "OPEN",
        minTeamSize: minTeamSize || 1,
        maxTeamSize: maxTeamSize || minTeamSize || 1,
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
  } catch {
    return serverErrorResponse("Failed to create sport");
  }
}
