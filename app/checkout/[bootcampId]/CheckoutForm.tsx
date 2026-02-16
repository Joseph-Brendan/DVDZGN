"use client"

import { BackButton } from "@/components/ui/back-button"
import { Lock } from "lucide-react"
import FlutterwavePaymentButton from "@/components/payment/FlutterwavePaymentButton"

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
    const currency = initialRegion === "NG" ? "NGN" : "USD"
    const amount = initialRegion === "NG" ? priceNGN : priceUSD
    const priceDisplay = initialRegion === "NG"
        ? `₦${priceNGN.toLocaleString()}`
        : `$${priceUSD}`

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

                    <div className="pt-2">
                        <FlutterwavePaymentButton
                            amount={amount}
                            currency={currency}
                            email={userEmail}
                            name={userName}
                            phone={userPhone}
                            bootcampId={bootcampId}
                            title={title}
                        />
                    </div>

                    <p className="text-xs text-center text-zinc-400">
                        By proceeding, you agree to our terms of service.
                    </p>
                </div>
            </div>
        </div>
    )
}
