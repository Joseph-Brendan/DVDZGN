import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Find user to ensure they exist
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Delete user (cascades enrollments, sessions, accounts)
        await prisma.user.delete({
            where: { id: session.user.id },
        })

        return NextResponse.json({ success: true, message: "Account deleted" })
    } catch (error) {
        console.error("Delete account error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
