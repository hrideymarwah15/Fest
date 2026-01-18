import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/security";

// GET all users
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const users = await db.user.findMany({
            where: {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                ],
            },
            include: {
                college: { select: { name: true } },
                _count: {
                    select: { registrations: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(users);
    } catch {
        return serverErrorResponse("Failed to fetch users");
    }
}
