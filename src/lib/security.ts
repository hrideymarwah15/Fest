import { NextResponse } from "next/server";
import { auth } from "./auth";
import { z } from "zod";
import crypto from "crypto";

/**
 * Generates a CSRF token for form protection
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validates CSRF token with timing-safe comparison
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );
  } catch {
    return false;
  }
}

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
 * More comprehensive sanitization including script tags and event handlers
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/\bon\w+\s*=/gi, "")
    // Encode HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    // Remove null bytes
    .replace(/\x00/g, "")
    .trim();
}

/**
 * Sanitizes an object's string fields recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(sanitized[key] as string);
    } else if (Array.isArray(sanitized[key])) {
      (sanitized as Record<string, unknown>)[key] = (sanitized[key] as unknown[]).map((item) => {
        if (typeof item === "string") return sanitizeInput(item);
        if (typeof item === "object" && item !== null) {
          return sanitizeObject(item as Record<string, unknown>);
        }
        return item;
      });
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        sanitized[key] as Record<string, unknown>
      );
    }
  }

  return sanitized;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Indian phone number
 */
export function isValidIndianPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * College name validation schema
 */
export const collegeNameSchema = z
  .string()
  .min(3, "College name must be at least 3 characters")
  .max(200, "College name must be at most 200 characters")
  .regex(
    /^[a-zA-Z0-9\s\-.,()&']+$/,
    "College name contains invalid characters"
  );

/**
 * User profile update schema
 */
export const profileUpdateSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .optional(),
  collegeId: z.string().cuid("Invalid college ID").optional(),
});

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
  customCollege: z.string().max(200).optional(),
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
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  collegeId: z.string().cuid().optional(),
  customCollege: z.string().max(200).optional(),
});

/**
 * Rate limiting map (in-memory, use Redis for production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

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

export function rateLimitResponse(resetTime: number) {
  return NextResponse.json(
    {
      message: "Too many requests. Please try again later.",
      resetTime
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  );
}
