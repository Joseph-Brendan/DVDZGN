import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover", // Updated to match other routes
    typescript: true,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET")
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature") as string

    let event: Stripe.Event

    try {
        if (!signature) throw new Error("Missing stripe-signature header")
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                await handlePaymentIntentSucceeded(paymentIntent)
                break
            default:
                // Is this event relevant? If not, just ignore.
                break
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("Error handling event:", error)
        return NextResponse.json({ error: "Error handling event" }, { status: 500 })
    }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { userId, bootcampId, email } = paymentIntent.metadata

    if (!userId || !bootcampId) {
        console.error("Missing metadata in payment intent:", paymentIntent.id, paymentIntent.metadata)
        throw new Error("Missing required metadata (userId, bootcampId)")
    }

    console.log(`Processing enrollment for user ${userId} in bootcamp ${bootcampId}`)

    // Idempotency check: verify if enrollment exists
    const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
            OR: [
                { userId: userId, bootcampId: bootcampId },
                { transactionId: paymentIntent.id }
            ]
        }
    })

    if (existingEnrollment) {
        console.log("Enrollment already exists, skipping.")
        return
    }

    // Double check specific user existence if needed
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        console.error(`User ${userId} not found for payment ${paymentIntent.id}`)
        throw new Error("User not found")
    }

    // Verify bootcamp & price (optional but good practice)
    const bootcamp = await prisma.bootcamp.findUnique({ where: { id: bootcampId } })
    if (!bootcamp) {
        console.error(`Bootcamp ${bootcampId} not found`)
        throw new Error("Bootcamp not found")
    }

    const expectedAmount = bootcamp.priceUSD * 100
    if (paymentIntent.amount < expectedAmount) {
        console.error(`Amount mismatch for ${paymentIntent.id}: Paid ${paymentIntent.amount}, Expected ${expectedAmount}`)
        // We might validly define partial payments later, but for now this is an error warn
        // We typically wouldn't throw here to avoid retries on a validation error, 
        // but let's log it. We enroll them anyway because they paid *something* in this simplistic logic? 
        // No, better to be strict.
        throw new Error("Payment amount mismatch")
    }

    // Create Enrollment
    await prisma.enrollment.create({
        data: {
            userId: userId,
            bootcampId: bootcampId,
            transactionId: paymentIntent.id,
            status: "enrolled",
            enrolledAt: new Date()
        }
    })

    console.log(`Successfully enrolled user ${userId} in bootcamp ${bootcampId}`)
}
