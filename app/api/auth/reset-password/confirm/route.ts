import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
    try {
        // FIX #5: Invalidate all existing sessions after password reset
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
        }

        // Rate limit by IP
        const ip = getClientIp(req)
        if (isRateLimited(`reset-confirm:${ip}`, 5, 60_000)) {
            return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 })
        }

        // Find the token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetToken) {
            return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
        }

        // Check expiry
        if (resetToken.expires < new Date()) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
            return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Hash new password and update user
        const hashedPassword = await hash(password, 10)

        // FIX #5: Use transaction to update password, delete tokens, AND invalidate all sessions
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            }),
            // Delete the used token (and any other tokens for this email)
            prisma.passwordResetToken.deleteMany({
                where: { email: resetToken.email }
            }),
            // Invalidate all existing sessions for this user
            prisma.session.deleteMany({
                where: { userId: user.id }
            })
        ])

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Reset password confirm error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
