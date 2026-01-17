import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Get all colleges (public)
export async function GET(req: NextRequest) {
  try {
    const colleges = await db.college.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        logoUrl: true,
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
