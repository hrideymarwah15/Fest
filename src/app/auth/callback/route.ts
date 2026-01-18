import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // If "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Sync user to our database if not exists
            const existingUser = await db.user.findUnique({
                where: { email: data.user.email! },
            });

            if (!existingUser) {
                // Create user in our database
                await db.user.create({
                    data: {
                        id: data.user.id,
                        email: data.user.email!,
                        name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
                        role: "PARTICIPANT",
                    },
                });
            }

            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                // we can be confident that there is no load balancer in between
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/error?message=Could not authenticate user`);
}
