import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { createRazorpayOrder } from "@/lib/razorpay";
import { registrationSchema, sanitizeInput, badRequestResponse, notFoundResponse, serverErrorResponse } from "@/lib/security";
import { logTransaction } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return badRequestResponse("Unauthorized");
    }

    const body = await req.json();

    // Resolve college ID (Find or Create)
    let finalCollegeId = body.collegeId;
    let finalCollegeName = body.collegeId;

    if (body.collegeId === "other") {
      if (!body.customCollege) {
        return badRequestResponse("Custom college name is required");
      }
      finalCollegeName = body.customCollege;
    }

    // Attempt to find college by ID first (in case it IS a CUID, though unlikely now)
    // or by Name (most likely)
    // We'll search by Name since our select values are names
    let college = await db.college.findFirst({
      where: {
        OR: [
          { id: finalCollegeId }, // In case a real ID is passed
          { name: { equals: finalCollegeName } } // Name match
        ]
      }
    });

    if (!college) {
      // Create new college
      // Generate a code from name (e.g. ABSS -> ABSS_INSTITUTE)
      const code = finalCollegeName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20) + "_" + Math.floor(Math.random() * 1000);

      college = await db.college.create({
        data: {
          name: finalCollegeName,
          code: code,
          address: "Added via Registration",
        }
      });
    }

    finalCollegeId = college.id;

    // We override the collegeId in the body for validation if schema expects CUID
    // But schema likely just checks string.
    const inputData = { ...body, collegeId: finalCollegeId };

    const validatedData = registrationSchema.parse({
      ...inputData,
      teamName: body.teamName ? sanitizeInput(body.teamName) : undefined,
      teamMembers: body.teamMembers?.map((member: any) => ({
        name: sanitizeInput(member.name),
        email: member.email,
        phone: member.phone,
      })),
    });

    // Check if user is already registered for this sport
    const existingRegistration = await db.registration.findUnique({
      where: {
        userId_sportId: {
          userId: session.user.id,
          sportId: validatedData.sportId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: "You are already registered for this sport" },
        { status: 400 }
      );
    }

    // Get sport details
    const sport = await db.sport.findUnique({
      where: { id: validatedData.sportId },
    });

    if (!sport) {
      return notFoundResponse("Sport");
    }

    if (!sport.registrationOpen) {
      return NextResponse.json(
        { message: "Registrations are closed for this sport" },
        { status: 400 }
      );
    }

    if (sport.filledSlots >= sport.maxSlots) {
      return NextResponse.json(
        { message: "No slots available for this sport" },
        { status: 400 }
      );
    }

    // Use transaction with optimistic locking to ensure atomic slot reservation
    // This prevents race conditions when multiple users register simultaneously
    const result = await db.$transaction(async (tx) => {
      // Double-check slot availability inside transaction (optimistic locking)
      const currentSport = await tx.sport.findUnique({
        where: { id: validatedData.sportId },
        select: { filledSlots: true, maxSlots: true, registrationOpen: true },
      });

      if (!currentSport) {
        throw new Error("Sport not found");
      }

      if (!currentSport.registrationOpen) {
        throw new Error("REGISTRATION_CLOSED");
      }

      if (currentSport.filledSlots >= currentSport.maxSlots) {
        throw new Error("SLOTS_FULL");
      }

      // Update user's phone number if provided and not already set
      // Also update collegeId if not set
      if (validatedData.phone) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            phone: validatedData.phone,
            collegeId: finalCollegeId, // Link user to college
            gender: validatedData.gender
          },
        });
      } else {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            collegeId: finalCollegeId,
            gender: validatedData.gender
          },
        });
      }

      // Create registration
      const registration = await tx.registration.create({
        data: {
          userId: session.user.id,
          sportId: validatedData.sportId,
          collegeId: finalCollegeId, // Use the resolved DB ID
          teamName: validatedData.teamName,
          teamMembers: validatedData.teamMembers
            ? validatedData.teamMembers
            : undefined,
          status: "PENDING",
        },
      });

      // Atomically increment filled slots with optimistic lock check
      // This UPDATE will fail if another transaction already filled the last slot
      const updatedSport = await tx.sport.updateMany({
        where: {
          id: validatedData.sportId,
          filledSlots: { lt: currentSport.maxSlots },
        },
        data: { filledSlots: { increment: 1 } },
      });

      if (updatedSport.count === 0) {
        throw new Error("SLOTS_FULL");
      }

      return registration;
    });

    const registration = result;

    // Log the transaction
    await logTransaction(
      "REGISTRATION_CREATED",
      "REGISTRATION",
      registration.id,
      session.user.id,
      {
        sportId: validatedData.sportId,
        collegeId: validatedData.collegeId,
        amount: sport.fee,
      }
    );

    // Check if user wants to pay immediately or later
    const payImmediately = body.payImmediately !== false; // Default to true for backward compatibility
    const razorpayConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== "rzp_test_your_key_id";

    if (payImmediately && razorpayConfigured) {
      // Create Razorpay order
      const order = await createRazorpayOrder({
        amount: sport.fee,
        receipt: `reg_${registration.id}`,
        notes: {
          registrationId: registration.id,
          sportId: sport.id,
          sportName: sport.name,
          userId: session.user.id,
        },
      });

      // Create payment record
      await db.payment.create({
        data: {
          registrationId: registration.id,
          razorpayOrderId: order.id,
          amount: sport.fee,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        registrationId: registration.id,
        orderId: order.id,
        amount: sport.fee,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } else {
      // Create payment record without order (pending payment - will be collected at counter/manually)
      await db.payment.create({
        data: {
          registrationId: registration.id,
          razorpayOrderId: `pending_${registration.id}`,
          amount: sport.fee,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        registrationId: registration.id,
        message: "Registration created successfully. Payment will be collected separately.",
        status: "PENDING",
        paymentRequired: true,
        amount: sport.fee,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequestResponse(error.issues[0].message);
    }

    // Improved error reporting for debugging
    let message = "Failed to create registration";
    if (error instanceof Error && error.message) {
      message += ": " + error.message;
    } else if (typeof error === "string") {
      message += ": " + error;
    }
    console.error("Registration error:", error);
    return serverErrorResponse(message);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const registrations = await db.registration.findMany({
      where: { userId: session.user.id },
      include: {
        sport: true,
        college: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { message: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
