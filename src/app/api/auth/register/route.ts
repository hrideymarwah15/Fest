import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  sanitizeInput,
  rateLimit,
  rateLimitResponse,
  badRequestResponse,
  serverErrorResponse
} from "@/lib/security";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (must start with 6-9)"),
  gender: z.enum(["MEN", "WOMEN", "MIXED", "OPEN"]).optional(),
  college: z.string().min(1, "College is required").max(200, "College name too long"),
  customCollege: z.string().max(200).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 registrations per minute per IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = rateLimit(`register:${ip}`, 5, 60000);
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Sanitize name and college inputs
    const sanitizedName = sanitizeInput(validatedData.name);
    const sanitizedCollege = sanitizeInput(validatedData.college);
    
    // Normalize email to lowercase
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check if user already exists (case-insensitive)
    const existingUser = await db.user.findFirst({
      where: { 
        email: { equals: normalizedEmail, mode: "insensitive" }
      },
    });

    if (existingUser) {
      return badRequestResponse("User already exists with this email");
    }

    // Resolve college
    const finalCollegeName = sanitizedCollege.trim();

    // Use transaction to prevent race conditions in college creation
    const result = await db.$transaction(async (tx) => {
      // Find or create college (with unique constraint handling)
      let college = await tx.college.findFirst({
        where: {
          name: { equals: finalCollegeName, mode: "insensitive" },
        },
      });

      if (!college) {
        // Create college with unique code
        const baseCode = finalCollegeName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15);
        const uniqueCode = `${baseCode}_${Date.now().toString(36)}`;

        try {
          college = await tx.college.create({
            data: {
              name: finalCollegeName,
              code: uniqueCode,
              address: "Added via Signup",
            },
          });
        } catch (e) {
          // If unique constraint violation, fetch existing
          college = await tx.college.findFirst({
            where: {
              name: { equals: finalCollegeName, mode: "insensitive" },
            },
          });
        }
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user with hashed password
      const user = await tx.user.create({
        data: {
          name: sanitizedName,
          email: normalizedEmail,
          phone: validatedData.phone,
          password: hashedPassword,
          collegeId: college?.id,
          gender: validatedData.gender,
          role: "PARTICIPANT",
        },
      });

      return user;
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: result.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequestResponse(error.issues[0].message);
    }

    return serverErrorResponse("Failed to register user");
  }
}
