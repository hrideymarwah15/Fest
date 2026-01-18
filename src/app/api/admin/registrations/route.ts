import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/security";

// Valid status values from Prisma schema
const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "WAITLISTED"] as const;
const statusSchema = z.enum(validStatuses).optional();

// Admin API for getting all registrations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Only check for ADMIN role, remove hardcoded email
    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get("sportId");
    const collegeId = searchParams.get("collegeId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100

    // Validate status if provided
    if (status) {
      const statusValidation = statusSchema.safeParse(status);
      if (!statusValidation.success) {
        return badRequestResponse("Invalid status value");
      }
    }

    const skip = (page - 1) * limit;

    const [registrations, totalCount] = await Promise.all([
      db.registration.findMany({
        where: {
          ...(sportId && { sportId }),
          ...(collegeId && { collegeId }),
          ...(status && { status: status as typeof validStatuses[number] }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          sport: true,
          college: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.registration.count({
        where: {
          ...(sportId && { sportId }),
          ...(collegeId && { collegeId }),
          ...(status && { status: status as typeof validStatuses[number] }),
        },
      }),
    ]);

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return serverErrorResponse("Failed to fetch registrations");
  }
}
