"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/ui/back-button"
import { Lock } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import StripePaymentForm from "@/components/payment/StripePaymentForm"
import FlutterwavePaymentButton from "@/components/payment/FlutterwavePaymentButton"

// Initialize Stripe outside to avoid recreating on every render
// Safely handle missing key to prevent runtime crashes
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

interface CheckoutFormProps {
    bootcampId: string
    title: string
    priceNGN: number
    priceUSD: number
    type: "live" | "recorded"
    initialRegion: "NG" | "INTL"
    userEmail: string
    userName: string
    userPhone?: string
}

export default function CheckoutForm({ bootcampId, title, priceNGN, priceUSD, type, initialRegion, userEmail, userName, userPhone }: CheckoutFormProps) {
    const region = initialRegion
    const [clientSecret, setClientSecret] = useState("")

    const priceDisplay = region === "NG"
        ? `₦${priceNGN.toLocaleString()}`
        : `$${priceUSD}`

    useEffect(() => {
        if (region === "INTL") {
            // Create PaymentIntent as soon as the page loads for Stripe
            fetch("/api/payment/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: priceUSD, bootcampId }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret))
                .catch((err) => console.error("Error creating PaymentIntent:", err))
        }
    }, [region, priceUSD, bootcampId])

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="h-screen bg-zinc-50 flex items-center justify-center p-4 relative">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <BackButton label="Cancel" />
            </div>
            <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h1 className="text-xl font-semibold mb-1">Checkout</h1>
                    <p className="text-sm text-zinc-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Secure Payment
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Bootcamp Summary */}
                    <div>
                        <h2 className="font-medium text-zinc-900">{title}</h2>
                        <p className="text-sm text-zinc-500">
                            {type === "live" ? "Live Cohort Enrollment" : "Recorded Course Access"}
                        </p>
                    </div>

                    {/* Price Display */}
                    <div className="flex items-center justify-between py-4 border-t border-zinc-100">
                        <span className="text-zinc-600">Total</span>
                        <span className="text-2xl font-bold tracking-tight text-zinc-900">{priceDisplay}</span>
                    </div>

                    {region === "NG" ? (
                        <div className="pt-2">
                            <FlutterwavePaymentButton
                                amount={priceNGN}
                                email={userEmail}
                                name={userName}
                                phone={userPhone}
                                bootcampId={bootcampId}
                                title={title}
                            />
                        </div>
                    ) : (
                        <div className="pt-2">
                            {stripePromise && clientSecret ? (
                                <Elements options={options} stripe={stripePromise}>
                                    <StripePaymentForm amount={priceUSD} bootcampId={bootcampId} />
                                </Elements>
                            ) : !stripePromise ? (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    Stripe configuration is missing. Please add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment variables.
                                </div>
                            ) : (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-center text-zinc-400">
                        By proceeding, you agree to our terms of service.
                    </p>
                </div>
            </div>
        </div>
    )
}
