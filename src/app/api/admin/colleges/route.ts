import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all colleges (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
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
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { message: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

// POST create a new college
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, code, address, logoUrl } = body;

    // Check if code already exists
    const existingCollege = await db.college.findUnique({
      where: { code },
    });

    if (existingCollege) {
      return NextResponse.json(
        { message: "College with this code already exists" },
        { status: 400 }
      );
    }

    const college = await db.college.create({
      data: {
        name,
        code,
        address,
        logoUrl,
      },
    });

    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json(
      { message: "Failed to create college" },
      { status: 500 }
    );
  }
}
