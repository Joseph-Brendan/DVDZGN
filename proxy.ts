import { withAuth } from "next-auth/middleware"

// FIX #6: Enhanced route protection at the edge
// Protects /dashboard, /checkout, and /api/payment routes
export default withAuth({
    pages: {
        signIn: "/auth/login",
    },
})

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/checkout/:path*",
        "/api/payment/:path*",
    ],
}
