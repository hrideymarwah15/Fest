import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET single college
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

    const college = await db.college.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            users: true,
            registrations: true,
          },
        },
      },
    });

    if (!college) {
      return NextResponse.json(
        { message: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(college);
  } catch (error) {
    console.error("Error fetching college:", error);
    return NextResponse.json(
      { message: "Failed to fetch college" },
      { status: 500 }
    );
  }
}

// PATCH update college
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
    const { name, code, address, logoUrl } = body;

    const college = await db.college.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address && { address }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return NextResponse.json(college);
  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json(
      { message: "Failed to update college" },
      { status: 500 }
    );
  }
}

// DELETE college
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

    // Check if college has users or registrations
    const users = await db.user.count({
      where: { collegeId: id },
    });

    const registrations = await db.registration.count({
      where: { collegeId: id },
    });

    if (users > 0 || registrations > 0) {
      return NextResponse.json(
        { message: "Cannot delete college with existing users or registrations" },
        { status: 400 }
      );
    }

    await db.college.delete({
      where: { id },
    });

    return NextResponse.json({ message: "College deleted" });
  } catch (error) {
    console.error("Error deleting college:", error);
    return NextResponse.json(
      { message: "Failed to delete college" },
      { status: 500 }
    );
  }
}
