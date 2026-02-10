import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { bootcampId, region } = await req.json()

    try {
        // 1. In real world: verify payment with provider

        // 2. Create Enrollment
        await prisma.enrollment.create({
            data: {
                userId: user.id,
                bootcampId,
                status: 'enrolled'
            }
        })

        // 3. Send Email
        const bootcamp = await prisma.bootcamp.findUnique({ where: { id: bootcampId } })
        if (bootcamp) {
            await import("@/lib/email").then(m => m.sendEnrollmentEmail(user.email!, bootcamp.title))
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        // Check for unique constraint (already enrolled)
        return NextResponse.json({ success: false, error: "Enrollment failed" }, { status: 500 })
    }
}
