import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/security";

const toggleSchema = z.object({
  sportId: z.string(),
  registrationOpen: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.email !== "admin@sportsfest.com")) {
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
        throw new Error("Sport not found");
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

    return serverErrorResponse("Failed to toggle sport registration");
  }
}