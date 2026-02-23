"use client"

import { useState } from "react"
import { BackButton } from "@/components/ui/back-button"
import { Lock, Tag, Loader2, CheckCircle, X } from "lucide-react"
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
    const originalAmount = initialRegion === "NG" ? priceNGN : priceUSD

    // Discount state
    const [discountCode, setDiscountCode] = useState("")
    const [appliedCode, setAppliedCode] = useState<string | null>(null)
    const [discountPercent, setDiscountPercent] = useState(0)
    const [discountError, setDiscountError] = useState("")
    const [isValidating, setIsValidating] = useState(false)

    const discountAmount = Math.round(originalAmount * (discountPercent / 100))
    const finalAmount = originalAmount - discountAmount

    const originalPriceDisplay = initialRegion === "NG"
        ? `₦${originalAmount.toLocaleString()}`
        : `$${originalAmount}`

    const finalPriceDisplay = initialRegion === "NG"
        ? `₦${finalAmount.toLocaleString()}`
        : `$${finalAmount}`

    const discountDisplay = initialRegion === "NG"
        ? `₦${discountAmount.toLocaleString()}`
        : `$${discountAmount}`

    const handleApplyCode = async () => {
        const code = discountCode.trim()
        if (!code) return

        setIsValidating(true)
        setDiscountError("")

        try {
            const res = await fetch("/api/discount/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            })

            const data = await res.json()

            if (res.ok && data.valid) {
                setAppliedCode(code.toUpperCase())
                setDiscountPercent(data.discountPercent)
                setDiscountError("")
            } else {
                setDiscountError(data.error || "Invalid discount code")
                setAppliedCode(null)
                setDiscountPercent(0)
            }
        } catch {
            setDiscountError("Failed to validate code. Please try again.")
        } finally {
            setIsValidating(false)
        }
    }

    const handleRemoveCode = () => {
        setAppliedCode(null)
        setDiscountPercent(0)
        setDiscountCode("")
        setDiscountError("")
    }

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

                    {/* Discount Code Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5" />
                            Discount Code <span style={{ color: "#000" }}>(It&apos;s optional)</span>
                        </label>
                        {appliedCode ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">{appliedCode}</span>
                                    <span className="text-xs text-green-600">{discountPercent}% off</span>
                                </div>
                                <button
                                    onClick={handleRemoveCode}
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => {
                                        setDiscountCode(e.target.value.toUpperCase())
                                        setDiscountError("")
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                                    placeholder="Enter code"
                                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase tracking-wider"
                                />
                                <button
                                    onClick={handleApplyCode}
                                    disabled={isValidating || !discountCode.trim()}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isValidating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Apply"
                                    )}
                                </button>
                            </div>
                        )}
                        {discountError && (
                            <p className="text-xs text-red-500 mt-1">{discountError}</p>
                        )}
                    </div>

                    {/* Price Display */}
                    <div className="py-4 border-t border-zinc-100 space-y-2">
                        {appliedCode ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Subtotal</span>
                                    <span className="text-sm text-zinc-500 line-through">{originalPriceDisplay}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-600">Discount ({discountPercent}%)</span>
                                    <span className="text-sm font-medium text-green-600">-{discountDisplay}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                                    <span className="text-zinc-600 font-medium">Total</span>
                                    <span className="text-2xl font-bold tracking-tight text-zinc-900">{finalPriceDisplay}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-600">Total</span>
                                <span className="text-2xl font-bold tracking-tight text-zinc-900">{originalPriceDisplay}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <FlutterwavePaymentButton
                            amount={finalAmount}
                            currency={currency}
                            email={userEmail}
                            name={userName}
                            phone={userPhone}
                            bootcampId={bootcampId}
                            title={title}
                            discountCode={appliedCode || undefined}
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
