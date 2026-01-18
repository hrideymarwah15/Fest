import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFoundResponse, serverErrorResponse } from "@/lib/security";

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
      return notFoundResponse("Sport");
    }

    return NextResponse.json(sport);
  } catch {
    return serverErrorResponse("Failed to fetch sport");
  }
}
