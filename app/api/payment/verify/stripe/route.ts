import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
})

export async function POST(req: Request) {
    try {
        const { payment_intent, bootcampId } = await req.json()

        if (!payment_intent || !bootcampId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // 1. Verify PaymentIntent with Stripe
        const intent = await stripe.paymentIntents.retrieve(payment_intent)

        if (intent.status !== "succeeded") {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 })
        }

        // 2. Find User (Prioritize Session)
        const session = await getServerSession(authOptions)
        let user

        if (session?.user?.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email }
            })
        }

        if (!user && intent.metadata.email) {
            // Fallback to metadata email
            user = await prisma.user.findUnique({
                where: { email: intent.metadata.email }
            })
        }

        if (!user) {
            // If still no user, we can't safely enroll. 
            // In this app flow, they should be logged in.
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // 3. Fetch Bootcamp and Verify Amount
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        })

        if (!bootcamp) {
            return NextResponse.json({ error: "Bootcamp not found" }, { status: 404 })
        }

        // Stripe amount is in cents, so compare cents to cents
        const expectedAmountCents = bootcamp.priceUSD * 100
        if (intent.amount < expectedAmountCents) {
            console.error(`Amount mismatch: paid ${intent.amount}, expected ${expectedAmountCents}`)
            return NextResponse.json({ error: "Payment amount does not match bootcamp price" }, { status: 400 })
        }

        // 4. Record Enrollment with transactionId
        // Check if already enrolled OR if transactionId was already used
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                OR: [
                    { userId: user.id, bootcampId: bootcampId },
                    { transactionId: payment_intent }
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
                transactionId: payment_intent,
                status: "enrolled"
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Stripe verification error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
