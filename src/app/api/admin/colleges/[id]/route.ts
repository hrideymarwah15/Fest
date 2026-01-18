import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeInput, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from "@/lib/security";

// GET single college
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
      return notFoundResponse("College");
    }

    return NextResponse.json(college);
  } catch {
    return serverErrorResponse("Failed to fetch college");
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
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { name, code, address, logoUrl } = body;

    // Sanitize inputs
    const sanitizedName = name ? sanitizeInput(name) : undefined;
    const sanitizedCode = code ? sanitizeInput(code) : undefined;
    const sanitizedAddress = address ? sanitizeInput(address) : undefined;

    const college = await db.college.update({
      where: { id },
      data: {
        ...(sanitizedName && { name: sanitizedName }),
        ...(sanitizedCode && { code: sanitizedCode }),
        ...(sanitizedAddress && { address: sanitizedAddress }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return NextResponse.json(college);
  } catch {
    return serverErrorResponse("Failed to update college");
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
      return unauthorizedResponse();
    }

    // Check if college has users or registrations
    const users = await db.user.count({
      where: { collegeId: id },
    });

    const registrations = await db.registration.count({
      where: { collegeId: id },
    });

    if (users > 0 || registrations > 0) {
      return badRequestResponse("Cannot delete college with existing users or registrations");
    }

    await db.college.delete({
      where: { id },
    });

    return NextResponse.json({ message: "College deleted" });
  } catch {
    return serverErrorResponse("Failed to delete college");
  }
}
