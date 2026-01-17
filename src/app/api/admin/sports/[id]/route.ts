import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET single sport
export async function GET(
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

    const sport = await db.sport.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!sport) {
      return NextResponse.json(
        { message: "Sport not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(sport);
  } catch (error) {
    console.error("Error fetching sport:", error);
    return NextResponse.json(
      { message: "Failed to fetch sport" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
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

    const sport = await db.sport.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(gender && { gender }),
        ...(teamSize && { teamSize }),
        ...(minTeamSize && { minTeamSize }),
        ...(rules && { rules }),
        ...(prizes && { prizes }),
        ...(fee !== undefined && { fee }),
        ...(maxSlots !== undefined && { maxSlots }),
        ...(imageUrl && { imageUrl }),
        ...(venue && { venue }),
        ...(schedule && { schedule }),
        ...(isActive !== undefined && { isActive }),
        ...(registrationOpen !== undefined && { registrationOpen }),
      },
    });

    return NextResponse.json(sport);
  } catch (error) {
    console.error("Error updating sport:", error);
    return NextResponse.json(
      { message: "Failed to update sport" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
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
  } catch (error) {
    console.error("Error deleting sport:", error);
    return NextResponse.json(
      { message: "Failed to delete sport" },
      { status: 500 }
    );
  }
}
