import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/security";
import { logTransaction } from "@/lib/logger";

// Valid roles enum matching Prisma schema
const validRoles = ["ADMIN", "PARTICIPANT"] as const;
type ValidRole = typeof validRoles[number];

// PATCH update user role
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return unauthorizedResponse();
        }

        // Prevent admin from changing their own role
        if (session.user.id === id) {
            return badRequestResponse("Cannot change your own role");
        }

        const body = await req.json();
        const { role } = body;
        
        // Validate role input
        if (!role || !validRoles.includes(role)) {
            return badRequestResponse("Invalid role. Must be ADMIN or PARTICIPANT");
        }

        // Get old user data for audit
        const oldUser = await db.user.findUnique({
            where: { id },
            select: { role: true, email: true },
        });

        if (!oldUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const user = await db.user.update({
            where: { id },
            data: { role: role as ValidRole },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        // Log role change for audit
        await logTransaction(
            "USER_ROLE_CHANGED",
            "USER",
            id,
            session.user.id,
            {
                userEmail: user.email,
                oldRole: oldUser.role,
                newRole: role,
                changedBy: session.user.email,
            }
        );

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to update user:", error);
        return serverErrorResponse("Failed to update user");
    }
}

// DELETE user
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return unauthorizedResponse();
        }

        // Prevent admin from deleting themselves
        if (session.user.id === id) {
            return badRequestResponse("Cannot delete your own account");
        }

        // Check if user has registrations
        const registrations = await db.registration.count({
            where: { userId: id },
        });

        if (registrations > 0) {
            return badRequestResponse("Cannot delete user with existing registrations");
        }

        await db.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted" });
    } catch {
        return serverErrorResponse("Failed to delete user");
    }
}
