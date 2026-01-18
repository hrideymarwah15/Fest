import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  profileUpdateSchema,
  sanitizeInput,
  rateLimit,
  rateLimitResponse,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse
} from "@/lib/security";
import { z } from "zod";

// Get user profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return notFoundResponse("User");
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      college: user.college,
      image: user.image,
      createdAt: user.createdAt,
    });
  } catch {
    return serverErrorResponse("Failed to fetch profile");
  }
}

// Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Rate limiting: 10 updates per minute per user
    const rateLimitResult = rateLimit(`profile-update:${session.user.id}`, 10, 60000);
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const body = await req.json();

    // Validate input
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return badRequestResponse(validationResult.error.issues[0]?.message || "Invalid input");
    }

    const { phone, collegeId } = validationResult.data;

    // Sanitize name if provided
    const sanitizedName = body.name ? sanitizeInput(body.name) : undefined;

    // Validate name if provided
    if (sanitizedName !== undefined) {
      if (sanitizedName.length < 2 || sanitizedName.length > 100) {
        return badRequestResponse("Name must be between 2 and 100 characters");
      }
    }

    // If collegeId is provided, verify it exists
    if (collegeId) {
      const college = await db.college.findUnique({
        where: { id: collegeId },
      });
      if (!college) {
        return badRequestResponse("Invalid college selected");
      }
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(sanitizedName && { name: sanitizedName }),
        ...(phone && { phone }),
        ...(collegeId && { collegeId }),
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      college: user.college,
      image: user.image,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequestResponse(error.issues[0]?.message || "Invalid input");
    }
    return serverErrorResponse("Failed to update profile");
  }
}
