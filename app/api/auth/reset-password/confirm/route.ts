import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
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
        const hashedPassword = await hash(password, 8)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        // Delete the used token (and any other tokens for this email)
        await prisma.passwordResetToken.deleteMany({
            where: { email: resetToken.email }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Reset password confirm error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
