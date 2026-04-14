"use client"

import { useState } from "react"
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface FlutterwavePaymentProps {
    amount: number
    currency: "NGN" | "USD"
    email: string
    name: string
    phone?: string
    bootcampId: string
    title: string
    discountCode?: string
}

export default function FlutterwavePaymentButton({ amount, currency, email, name, phone, bootcampId, title, discountCode }: FlutterwavePaymentProps) {
    const router = useRouter()
    // I6: Use crypto.randomUUID() for guaranteed unique tx_ref
    const [txRef] = useState(() =>
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    )
    const [isProcessing, setIsProcessing] = useState(false)

    // NGN: full local options | USD: card only (international)
    const paymentOptions = currency === "NGN"
        ? "card,banktransfer,ussd"
        : "card"

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
        tx_ref: txRef,
        amount: amount,
        currency: currency,
        payment_options: paymentOptions,
        customer: {
            email: email,
            phone_number: phone || "",
            name: name,
        },
        customizations: {
            title: title,
            description: "Bootcamp Enrollment",
            logo: "",
        },
        meta: {
            bootcampId: bootcampId,
            ...(discountCode ? { discountCode } : {}),
        },
    }

    const handleFlutterwavePayment = useFlutterwave(config)

    // C2: Retry with exponential backoff
    const verifyAndEnroll = async (transactionId: number, maxRetries = 3) => {
        setIsProcessing(true)
        let lastError = ""

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Exponential backoff: 0ms, 2s, 4s, 8s
                if (attempt > 0) {
                    const delay = Math.pow(2, attempt) * 1000
                    toast.info(`Retrying verification (attempt ${attempt + 1}/${maxRetries + 1})...`)
                    await new Promise(r => setTimeout(r, delay))
                }

                const verifyRes = await fetch("/api/payment/verify/flutterwave", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transaction_id: transactionId,
                        bootcampId: bootcampId,
                        ...(discountCode ? { discountCode } : {})
                    })
                })

                const verifyData = await verifyRes.json()

                if (verifyData.success) {
                    toast.success("Payment verified! Redirecting...")
                    router.push(`/payment/success?bootcampId=${bootcampId}`)
                    return // Success — exit retry loop
                }

                if (verifyData.pending) {
                    // Payment still processing — continue retrying
                    lastError = "Payment is still being processed"
                    continue
                }

                // Non-retryable error (amount mismatch, not found, etc.)
                if (verifyRes.status === 400 || verifyRes.status === 404) {
                    toast.error(verifyData.error || "Payment verification failed. Please contact support.")
                    setIsProcessing(false)
                    return
                }

                // Auth error — session may have expired, still retryable via webhook
                lastError = verifyData.error || "Verification failed"

            } catch (error) {
                console.error(`Verification attempt ${attempt + 1} failed:`, error)
                lastError = "Network error during verification"
            }
        }

        // All retries exhausted — direct user to recovery
        toast.error(
            `Verification failed: ${lastError}. Your payment was received — visit your dashboard or contact support.`,
            { duration: 10000 }
        )
        router.push(`/dashboard?recover_payment=true&transaction_id=${transactionId}&bootcampId=${bootcampId}`)
        setIsProcessing(false)
    }

    const currencySymbol = currency === "NGN" ? "₦" : "$"

    return (
        <Button
            className="w-full h-12 text-base"
            disabled={isProcessing}
            onClick={() => {
                handleFlutterwavePayment({
                    callback: async (response) => {
                        closePaymentModal()

                        if (response.status === "successful" || response.status === "completed") {
                            // Instant payment (card) — verify with retries
                            await verifyAndEnroll(response.transaction_id)
                        } else if (response.status === "pending") {
                            // Bank transfer / delayed — poll for confirmation with retries
                            setIsProcessing(true)
                            toast.info("Payment is being processed. We'll verify it shortly...")

                            let verified = false
                            for (let attempt = 0; attempt < 6; attempt++) {
                                await new Promise(r => setTimeout(r, 5000))
                                try {
                                    const verifyRes = await fetch("/api/payment/verify/flutterwave", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            transaction_id: response.transaction_id,
                                            bootcampId: bootcampId,
                                            ...(discountCode ? { discountCode } : {})
                                        })
                                    })
                                    const verifyData = await verifyRes.json()
                                    if (verifyData.success) {
                                        verified = true
                                        toast.success("Payment confirmed! Redirecting...")
                                        router.push(`/payment/success?bootcampId=${bootcampId}`)
                                        break
                                    }
                                } catch {
                                    // continue polling
                                }
                            }

                            if (!verified) {
                                toast.info("Your payment is still being processed. You'll be enrolled once it's confirmed.", { duration: 8000 })
                                router.push("/dashboard")
                            }
                            setIsProcessing(false)
                        } else {
                            toast.error("Payment was not completed. Please try again.")
                        }
                    },
                    onClose: () => {
                        if (!isProcessing) {
                            toast.info("Payment window closed. If you completed a bank transfer, your enrollment will be processed shortly.")
                        }
                    },
                })
            }}
        >
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Payment...
                </>
            ) : (
                `Pay ${currencySymbol}${amount.toLocaleString()}`
            )}
        </Button>
    )
}
