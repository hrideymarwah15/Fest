import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Admin route protection
        if (path.startsWith("/admin")) {
            if (token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        return NextResponse.next();
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

                // Check if it's a public route or public API
                if (publicRoutes.some((route) => path === route || path.startsWith("/sports/"))) {
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
        // Protected routes
        "/dashboard/:path*",
        "/admin/:path*",
        "/register/:path*",
        // Exclude API routes, static files, and public pages
        "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
    ],
};
