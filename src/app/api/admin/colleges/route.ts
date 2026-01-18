import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeInput, collegeNameSchema, unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/security";

// GET all colleges (admin)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const colleges = await db.college.findMany({
      include: {
        _count: {
          select: {
            users: true,
            registrations: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(colleges);
  } catch {
    return serverErrorResponse("Failed to fetch colleges");
  }
}

// POST create a new college
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { name, code, address, logoUrl } = body;

    // Validate and sanitize
    const nameValidation = collegeNameSchema.safeParse(name);
    if (!nameValidation.success) {
      return badRequestResponse(nameValidation.error.issues[0]?.message || "Invalid college name");
    }
    const sanitizedName = sanitizeInput(name);
    const sanitizedCode = sanitizeInput(code);
    const sanitizedAddress = address ? sanitizeInput(address) : undefined;

    // Check if code already exists
    const existingCollege = await db.college.findUnique({
      where: { code: sanitizedCode },
    });

    if (existingCollege) {
      return badRequestResponse("College with this code already exists");
    }

    const college = await db.college.create({
      data: {
        name: sanitizedName,
        code: sanitizedCode,
        address: sanitizedAddress,
        logoUrl,
      },
    });

    return NextResponse.json(college, { status: 201 });
  } catch {
    return serverErrorResponse("Failed to create college");
  }
}
