import { NextResponse } from "next/server";
import { auth } from "./auth";
import { z } from "zod";

/**
 * Validates admin access and returns session
 * @returns Session if valid, otherwise throws error
 */
export async function validateAdminAccess() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized - No session");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized - Admin access required");
  }

  return session;
}

/**
 * Sanitizes input string to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Validates and sanitizes sport creation data
 */
export const sportCreationSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(1000),
  type: z.enum(["INDIVIDUAL", "TEAM"]),
  gender: z.enum(["MEN", "WOMEN", "MIXED", "OPEN"]).optional(),
  minTeamSize: z.number().min(1).max(50),
  maxTeamSize: z.number().min(1).max(50),
  rules: z.array(z.string()).optional(),
  fee: z.number().min(0).max(100000),
  maxSlots: z.number().min(1).max(10000),
  image: z.string().url().optional(),
  venue: z.string().min(3).max(100).optional(),
  registrationOpen: z.boolean().optional(),
});

/**
 * Validates and sanitizes registration data
 */
export const registrationSchema = z.object({
  sportId: z.string().cuid(),
  collegeId: z.string().cuid(),
  customCollege: z.string().optional(),
  gender: z.enum(["MEN", "WOMEN", "MIXED", "OPEN"]).optional(),
  teamName: z.string().max(100).optional(),
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(2).max(50),
        email: z.string().email("Invalid email format"),
        phone: z
          .string()
          .min(10, "Phone number must be at least 10 digits")
          .max(15, "Phone number must be at most 15 digits")
          .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (must start with 6-9)"),
      })
    )
    .optional()
    .refine(
      (members) => !members || members.length > 0,
      "Team members array must not be empty if provided"
    ),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (must start with 6-9)"),
  payImmediately: z.boolean().optional().default(true),
});

/**
 * Standardized error responses
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { message: "Unauthorized" },
    { status: 401 }
  );
}

export function badRequestResponse(message: string) {
  return NextResponse.json(
    { message },
    { status: 400 }
  );
}

export function notFoundResponse(entity: string) {
  return NextResponse.json(
    { message: `${entity} not found` },
    { status: 404 }
  );
}

export function serverErrorResponse(message: string = "Internal server error") {
  return NextResponse.json(
    { message },
    { status: 500 }
  );
}