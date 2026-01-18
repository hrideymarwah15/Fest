import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
    }

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
    });
}

// Helper function to get authenticated user with database info
export async function auth() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return null;

        // Get user details from our database
        const dbUser = await db.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, collegeId: true, name: true, phone: true },
        });

        if (!dbUser) return null;

        return {
            user: {
                id: dbUser.id,
                email: user.email,
                name: dbUser.name,
                role: dbUser.role,
                collegeId: dbUser.collegeId,
                phone: dbUser.phone,
            },
        };
    } catch (error) {
        console.error("Auth error:", error);
        return null;
    }
}
