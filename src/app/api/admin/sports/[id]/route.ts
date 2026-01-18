import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { sanitizeInput, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/security";

// GET single sport
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const sport = await db.sport.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!sport) {
      return notFoundResponse("Sport");
    }

    return NextResponse.json(sport);
  } catch {
    return serverErrorResponse("Failed to fetch sport");
  }
}

// PATCH update sport
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const {
      name,
      description,
      type,
      teamSize,
      minTeamSize,
      rules,
      prizes,
      fee,
      maxSlots,
      imageUrl,
      venue,
      schedule,
      isActive,
      registrationOpen,
      gender,
    } = body;

    // Sanitize string inputs
    const sanitizedName = name ? sanitizeInput(name) : undefined;
    const sanitizedDescription = description ? sanitizeInput(description) : undefined;
    const sanitizedVenue = venue ? sanitizeInput(venue) : undefined;

    const sport = await db.sport.update({
      where: { id },
      data: {
        ...(sanitizedName && { name: sanitizedName }),
        ...(sanitizedDescription && { description: sanitizedDescription }),
        ...(type && { type }),
        ...(gender && { gender }),
        ...(teamSize && { teamSize }),
        ...(minTeamSize && { minTeamSize }),
        ...(rules && { rules }),
        ...(prizes && { prizes }),
        ...(fee !== undefined && { fee }),
        ...(maxSlots !== undefined && { maxSlots }),
        ...(imageUrl && { imageUrl }),
        ...(sanitizedVenue && { venue: sanitizedVenue }),
        ...(schedule && { schedule }),
        ...(isActive !== undefined && { isActive }),
        ...(registrationOpen !== undefined && { registrationOpen }),
      },
    });

    return NextResponse.json(sport);
  } catch {
    return serverErrorResponse("Failed to update sport");
  }
}

// DELETE sport
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

    // Check if sport has registrations
    const registrations = await db.registration.count({
      where: { sportId: id },
    });

    if (registrations > 0) {
      // Soft delete instead
      await db.sport.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: "Sport deactivated (has existing registrations)",
      });
    }

    await db.sport.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sport deleted" });
  } catch {
    return serverErrorResponse("Failed to delete sport");
  }
}
