import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeInput, unauthorizedResponse, serverErrorResponse } from "@/lib/security";

// GET all users
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(req.url);
        const rawSearch = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100
        
        // Sanitize search input to prevent injection
        const search = sanitizeInput(rawSearch).trim();
        const skip = (page - 1) * limit;

        const whereClause = search ? {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ],
        } : {};

        const [users, totalCount] = await Promise.all([
            db.user.findMany({
                where: whereClause,
                include: {
                    college: { select: { name: true } },
                    _count: {
                        select: { registrations: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db.user.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return serverErrorResponse("Failed to fetch users");
    }
}
