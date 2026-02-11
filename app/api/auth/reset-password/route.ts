import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Always return success to prevent email enumeration
        const user = await prisma.user.findUnique({ where: { email } })

        if (user) {
            // Delete any existing tokens for this email
            await prisma.passwordResetToken.deleteMany({ where: { email } })

            // Generate a secure token
            const token = randomBytes(32).toString("hex")

            // Store token with 1-hour expiry
            await prisma.passwordResetToken.create({
                data: {
                    email,
                    token,
                    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                }
            })

            // Send email
            await sendPasswordResetEmail(email, token)
        }

        // Always return success (security: don't reveal if email exists)
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Reset password request error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
