import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from "@/lib/security";

const toggleSchema = z.object({
  sportId: z.string(),
  registrationOpen: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only check for ADMIN role, remove hardcoded email
    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const validatedData = toggleSchema.parse(body);

    // Use transaction to ensure atomic update
    const sport = await db.$transaction(async (tx) => {
      // Get current sport state
      const currentSport = await tx.sport.findUnique({
        where: { id: validatedData.sportId },
      });

      if (!currentSport) {
        throw new Error("SPORT_NOT_FOUND");
      }

      // Update sport registration status
      return await tx.sport.update({
        where: { id: validatedData.sportId },
        data: { registrationOpen: validatedData.registrationOpen },
      });
    });

    return NextResponse.json({
      message: `Sport registration ${sport.registrationOpen ? "opened" : "closed"}`,
      sport,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequestResponse(error.issues[0].message);
    }

    // Handle specific errors
    if (error instanceof Error && error.message === "SPORT_NOT_FOUND") {
      return notFoundResponse("Sport");
    }

    console.error("Failed to toggle sport registration:", error);
    return serverErrorResponse("Failed to toggle sport registration");
  }
}