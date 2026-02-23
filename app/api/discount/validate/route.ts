import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
    try {
        // FIX #3: Rate limit — 5 attempts per IP per minute
        const ip = getClientIp(req)
        if (isRateLimited(`discount:${ip}`, 5, 60_000)) {
            return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 })
        }

        // FIX #3: Require authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "You must be logged in to use discount codes" }, { status: 401 })
        }

        const { code } = await req.json()

        if (!code || typeof code !== "string") {
            return NextResponse.json({ error: "Discount code is required" }, { status: 400 })
        }

        const discountCode = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase().trim() }
        })

        if (!discountCode) {
            return NextResponse.json({ error: "Invalid discount code" }, { status: 404 })
        }

        if (!discountCode.isActive) {
            return NextResponse.json({ error: "This discount code is no longer active" }, { status: 400 })
        }

        const now = new Date()

        if (discountCode.validFrom && now < discountCode.validFrom) {
            return NextResponse.json({ error: "This discount code is not yet valid" }, { status: 400 })
        }

        if (discountCode.validUntil && now > discountCode.validUntil) {
            return NextResponse.json({ error: "This discount code has expired" }, { status: 400 })
        }

        if (discountCode.maxUses !== null && discountCode.currentUses >= discountCode.maxUses) {
            return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 })
        }

        return NextResponse.json({
            valid: true,
            discountPercent: discountCode.discountPercent,
            description: discountCode.description
        })

    } catch (error) {
        console.error("Discount validation error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
