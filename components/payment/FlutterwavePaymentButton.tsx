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
    const [txRef] = useState(() => Date.now().toString())
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

    const verifyAndEnroll = async (transactionId: number) => {
        setIsProcessing(true)
        try {
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
            } else {
                toast.error(verifyData.error || "Payment verification failed. Please contact support.")
            }
        } catch (error) {
            console.error("Verification error:", error)
            toast.error("An error occurred verifying your payment. Please contact support.")
        } finally {
            setIsProcessing(false)
        }
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
                            // Instant payment (card) — verify immediately
                            await verifyAndEnroll(response.transaction_id)
                        } else if (response.status === "pending") {
                            // Bank transfer / delayed — poll for confirmation
                            setIsProcessing(true)
                            toast.info("Payment is being processed. We'll verify it shortly...")

                            let verified = false
                            for (let attempt = 0; attempt < 5; attempt++) {
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
                                toast.info("Your payment is still being processed. You'll be enrolled once it's confirmed.")
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
