import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, request: NextRequest) {
    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Content Security Policy
    const cspReportUri = process.env.CSP_REPORT_URI;
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
        "frame-src 'self' https://api.razorpay.com",
        cspReportUri ? `report-uri ${cspReportUri}` : "",
    ]
        .filter(Boolean)
        .join("; ");

    response.headers.set("Content-Security-Policy", csp);

    // CORS for API routes
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

export default withAuth(
    function proxy(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Handle preflight requests
        if (req.method === "OPTIONS") {
            const response = new NextResponse(null, { status: 200 });
            return addSecurityHeaders(response, req);
        }

        // Admin route protection
        if (path.startsWith("/admin")) {
            if (token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        const response = NextResponse.next();
        return addSecurityHeaders(response, req);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Public routes that don't require auth
                const publicRoutes = [
                    "/",
                    "/sports",
                    "/auth/signin",
                    "/auth/signup",
                    "/auth/error",
                    "/about",
                    "/contact",
                ];

                // Public API routes that don't require auth
                const publicApiRoutes = [
                    "/api/sports",
                    "/api/colleges",
                    "/api/auth",
                ];

                // Check if it's a public route
                if (publicRoutes.some((route) => path === route || path.startsWith("/sports/"))) {
                    return true;
                }

                // Check if it's a public API route
                if (publicApiRoutes.some((route) => path.startsWith(route))) {
                    return true;
                }

                // All other routes require authentication
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
