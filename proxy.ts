import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function addSecurityHeaders(response: NextResponse, request: NextRequest) {
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    const cspReportUri = process.env.CSP_REPORT_URI;
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.supabase.co",
        "frame-src 'self' https://api.razorpay.com",
        cspReportUri ? `report-uri ${cspReportUri}` : "",
    ]
        .filter(Boolean)
        .join("; ");
    response.headers.set("Content-Security-Policy", csp);

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
    const origin = request.headers.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-CSRF-Token"
        );
        response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
}

export async function proxy(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 200 });
        return addSecurityHeaders(response, request);
    }

    // If Supabase env vars are missing, just pass through with security headers
    if (!supabaseUrl || !supabaseAnonKey) {
        const response = NextResponse.next({ request });
        return addSecurityHeaders(response, request);
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/sports",
        "/auth/signin",
        "/auth/signup",
        "/auth/error",
        "/auth/callback",
        "/about",
        "/contact",
    ];
    const publicApiRoutes = [
        "/api/sports",
        "/api/colleges",
        "/api/auth",
    ];

    const isPublicRoute = publicRoutes.some(
        (route) => path === route || path.startsWith("/sports/")
    );
    const isPublicApiRoute = publicApiRoutes.some((route) => path.startsWith(route));

    // Allow public routes
    if (isPublicRoute || isPublicApiRoute) {
        return addSecurityHeaders(supabaseResponse, request);
    }

    // Protected routes - redirect to signin if not authenticated
    const protectedPaths = ["/dashboard", "/profile", "/admin", "/register"];
    const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/signin";
        url.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(url);
    }

    // Auth routes - redirect to dashboard if already logged in
    const authPaths = ["/auth/signin", "/auth/signup"];
    const isAuthPath = authPaths.some((p) => path.startsWith(p));

    if (isAuthPath && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return addSecurityHeaders(supabaseResponse, request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
