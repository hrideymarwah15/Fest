import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { sanitizeInput, rateLimit, rateLimitResponse, badRequestResponse, serverErrorResponse } from "@/lib/security";

const syncUserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1).max(100),
    phone: z.string().optional(),
    gender: z.enum(["MEN", "WOMEN", "MIXED", "OPEN"]).optional(),
    college: z.string().min(1).max(200).optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = rateLimit(`sync-user:${ip}`, 10, 60000);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.resetTime);
        }

        const body = await req.json();
        const validatedData = syncUserSchema.parse(body);

        // Sanitize inputs
        const sanitizedName = sanitizeInput(validatedData.name);
        const sanitizedCollege = validatedData.college ? sanitizeInput(validatedData.college) : undefined;
        const normalizedEmail = validatedData.email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { id: validatedData.id },
                    { email: { equals: normalizedEmail, mode: "insensitive" } }
                ]
            },
        });

        if (existingUser) {
            // Update existing user
            await db.user.update({
                where: { id: existingUser.id },
                data: {
                    name: sanitizedName,
                    phone: validatedData.phone,
                    gender: validatedData.gender,
                },
            });
            return NextResponse.json({ message: "User updated successfully" });
        }

        // Handle college creation if provided
        let collegeId: string | undefined;
        if (sanitizedCollege) {
            const finalCollegeName = sanitizedCollege.trim();

            let college = await db.college.findFirst({
                where: {
                    name: { equals: finalCollegeName, mode: "insensitive" },
                },
            });

            if (!college) {
                const baseCode = finalCollegeName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15);
                const uniqueCode = `${baseCode}_${Date.now().toString(36)}`;

                college = await db.college.create({
                    data: {
                        name: finalCollegeName,
                        code: uniqueCode,
                        address: "Added via Signup",
                    },
                });
            }

            collegeId = college.id;
        }

        // Create new user
        await db.user.create({
            data: {
                id: validatedData.id,
                name: sanitizedName,
                email: normalizedEmail,
                phone: validatedData.phone,
                gender: validatedData.gender,
                collegeId: collegeId,
                role: "PARTICIPANT",
            },
        });

        return NextResponse.json({ message: "User synced successfully" }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return badRequestResponse(error.issues[0].message);
        }
        console.error("Error syncing user:", error);
        return serverErrorResponse("Failed to sync user");
    }
}
