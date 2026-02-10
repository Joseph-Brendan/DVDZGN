import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover", // Updated to match installed types
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { amount, bootcampId } = await req.json()

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: session.user.id,
                email: session.user.email,
                bootcampId: bootcampId,
            },
        })

        return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        console.error("Stripe error:", error)
        return NextResponse.json({ error: "Error processing payment" }, { status: 500 })
    }
}
