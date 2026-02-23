import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/email"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // FIX #7: Rate limit — 10 registrations per IP per 15 minutes
        const ip = getClientIp(req)
        if (isRateLimited(`register:${ip}`, 10, 900_000)) {
            return NextResponse.json(
                { error: "Too many registration attempts. Please try again later." },
                { status: 429 }
            )
        }

        // Basic input validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        const exists = await prisma.user.findUnique({
            where: { email },
        })

        if (exists) {
            // FIX #7: Generic message to prevent email enumeration
            return NextResponse.json(
                { error: "Unable to create account. Please try a different email or log in." },
                { status: 400 }
            )
        }

        const hashedPassword = await hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        // Send welcome email (fire-and-forget, don't block registration)
        sendWelcomeEmail(email, name).catch((err) =>
            console.error("Failed to send welcome email:", err)
        )

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
        })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}
