import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendWaitlistConfirmationEmail, sendAdminWaitlistNotification } from "@/lib/email"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be signed in to join a waitlist" },
                { status: 401 }
            )
        }

        const { bootcampId } = await req.json()

        if (!bootcampId) {
            return NextResponse.json(
                { error: "Missing bootcampId" },
                { status: 400 }
            )
        }

        // Verify bootcamp exists and is inactive
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        })

        if (!bootcamp) {
            return NextResponse.json(
                { error: "Bootcamp not found" },
                { status: 404 }
            )
        }

        if (bootcamp.isActive) {
            return NextResponse.json(
                { error: "This bootcamp is already active. You can enroll directly." },
                { status: 400 }
            )
        }

        // Check if already on waitlist
        const existing = await prisma.waitlistEntry.findUnique({
            where: {
                userId_bootcampId: {
                    userId: session.user.id,
                    bootcampId
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: "You are already on the waitlist for this bootcamp" },
                { status: 409 }
            )
        }

        // Create waitlist entry
        await prisma.waitlistEntry.create({
            data: {
                userId: session.user.id,
                bootcampId
            }
        })

        // Send emails (fire-and-forget)
        const userName = session.user.name || "User"
        const userEmail = session.user.email || ""

        sendWaitlistConfirmationEmail(userEmail, userName, bootcamp.title).catch((err) =>
            console.error("Failed to send waitlist confirmation email:", err)
        )

        sendAdminWaitlistNotification(userName, userEmail, bootcamp.title).catch((err) =>
            console.error("Failed to send admin waitlist notification:", err)
        )

        return NextResponse.json({ success: true, message: "You have been added to the waitlist!" })
    } catch (error) {
        console.error("Waitlist join error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        const bootcampId = req.nextUrl.searchParams.get("bootcampId")

        if (!bootcampId) {
            return NextResponse.json(
                { error: "Missing bootcampId" },
                { status: 400 }
            )
        }

        const entry = await prisma.waitlistEntry.findUnique({
            where: {
                userId_bootcampId: {
                    userId: session.user.id,
                    bootcampId
                }
            }
        })

        return NextResponse.json({ onWaitlist: !!entry })
    } catch (error) {
        console.error("Waitlist check error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}
