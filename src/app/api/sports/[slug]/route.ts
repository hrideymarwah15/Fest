import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sport = await db.sport.findUnique({
      where: { slug },
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
