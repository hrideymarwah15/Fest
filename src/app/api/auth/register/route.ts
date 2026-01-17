import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Invalid phone number"),
  gender: z.enum(["MEN", "WOMEN", "MIXED", "OPEN"]).optional(),
  college: z.string().min(1, "College is required"),
  customCollege: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Resolve college
    let finalCollegeName = validatedData.college;
    if (finalCollegeName === "other") {
      if (!validatedData.customCollege) {
        return NextResponse.json({ message: "Custom college name is required" }, { status: 400 });
      }
      finalCollegeName = validatedData.customCollege;
    }

    // Find or create college
    let college = await db.college.findFirst({
      where: { name: finalCollegeName }, // Match by name not code
    });

    if (!college) {
      // Create college if it doesn't exist
      const code = finalCollegeName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20) + "_" + Math.floor(Math.random() * 1000);

      college = await db.college.create({
        data: {
          name: finalCollegeName,
          code: code,
          address: "Added via Signup",
        },
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user with hashed password
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        collegeId: college?.id,
        gender: validatedData.gender,
        role: "PARTICIPANT",
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
