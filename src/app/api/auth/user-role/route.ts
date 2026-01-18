import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ role: null }, { status: 401 });
        }

        // Get user role from our database
        const dbUser = await db.user.findUnique({
            where: { email: user.email! },
            select: { role: true },
        });

        return NextResponse.json({ role: dbUser?.role || "PARTICIPANT" });
    } catch (error) {
        console.error("Error fetching user role:", error);
        return NextResponse.json({ role: null }, { status: 500 });
    }
}
