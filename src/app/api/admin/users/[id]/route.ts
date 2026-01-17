import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH update user role
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Prevent admin from changing their own role
        if (session.user.id === id) {
            return NextResponse.json(
                { message: "Cannot change your own role" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { role } = body;

        const user = await db.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { message: "Failed to update user" },
            { status: 500 }
        );
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
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Prevent admin from deleting themselves
        if (session.user.id === id) {
            return NextResponse.json(
                { message: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        // Check if user has registrations
        const registrations = await db.registration.count({
            where: { userId: id },
        });

        if (registrations > 0) {
            // Option: Force delete related registrations or block
            // For now, let's block
            return NextResponse.json(
                { message: "Cannot delete user with existing registrations" },
                { status: 400 }
            );
        }

        await db.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { message: "Failed to delete user" },
            { status: 500 }
        );
    }
}
