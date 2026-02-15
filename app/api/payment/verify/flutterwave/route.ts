import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEnrollmentEmail, sendAdminEnrollmentNotification } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const { transaction_id, bootcampId } = await req.json()

        if (!transaction_id || !bootcampId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY

        if (!flwSecretKey) {
            console.error("FLUTTERWAVE_SECRET_KEY is not set")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // 1. Verify transaction with Flutterwave
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${flwSecretKey}`
            }
        })

        const data = await response.json()

        if (data.status !== "success") {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
        }

        const { status, currency, amount, customer } = data.data

        // 2. Validate transaction details
        // In a real app, verify amount corresponds to bootcamp price
        if (status !== "successful" || currency !== "NGN") {
            return NextResponse.json({ error: "Invalid transaction status or currency" }, { status: 400 })
        }

        // 3. Find User (Prioritize Session)
        const session = await getServerSession(authOptions)
        let user

        if (session?.user?.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email }
            })
        }

        if (!user) {
            // Fallback to transaction email if session expired
            user = await prisma.user.findUnique({
                where: { email: customer.email }
            })

            if (!user) {
                return NextResponse.json({ error: "User not found. Please log in and try again." }, { status: 401 })
            }
        }

        // 4. Fetch Bootcamp and Verify Amount
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        })

        if (!bootcamp) {
            return NextResponse.json({ error: "Bootcamp not found" }, { status: 404 })
        }

        if (amount < bootcamp.priceNGN) {
            console.error(`Amount mismatch: paid ${amount}, expected ${bootcamp.priceNGN}`)
            return NextResponse.json({ error: "Payment amount does not match bootcamp price" }, { status: 400 })
        }

        // 5. Record Enrollment with transactionId
        // Check if already enrolled OR if transactionId was already used
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                OR: [
                    { userId: user.id, bootcampId: bootcampId },
                    { transactionId: String(transaction_id) }
                ]
            }
        })

        if (existingEnrollment) {
            return NextResponse.json({ success: true, message: "Already enrolled or transaction already used" })
        }

        await prisma.enrollment.create({
            data: {
                userId: user.id,
                bootcampId: bootcampId,
                transactionId: String(transaction_id),
                status: "enrolled"
            }
        })

        // 5. Send Email
        // 5. Send Email
        await sendEnrollmentEmail(user.email!, bootcamp.title)
        await sendAdminEnrollmentNotification(user.email!, bootcamp.title)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Flutterwave verification error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
