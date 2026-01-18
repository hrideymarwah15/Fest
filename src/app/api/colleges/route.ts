import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serverErrorResponse } from "@/lib/security";

// Get all colleges (public)
export async function GET() {
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
  } catch {
    return serverErrorResponse("Failed to fetch colleges");
  }
}
