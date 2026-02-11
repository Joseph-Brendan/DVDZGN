"use client"

import { useState } from "react"
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface FlutterwavePaymentProps {
    amount: number
    email: string
    name: string
    phone?: string
    bootcampId: string
    title: string
}

export default function FlutterwavePaymentButton({ amount, email, name, phone, bootcampId, title }: FlutterwavePaymentProps) {
    const router = useRouter()
    const [txRef] = useState(() => Date.now().toString())
    const [isProcessing, setIsProcessing] = useState(false)

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
        tx_ref: txRef,
        amount: amount,
        currency: "NGN",
        payment_options: "card,mobilemoney,ussd",
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
    }

    const handleFlutterwavePayment = useFlutterwave(config)

    return (
        <Button
            className="w-full h-12 text-base"
            disabled={isProcessing}
            onClick={() => {
                handleFlutterwavePayment({
                    callback: async (response) => {
                        closePaymentModal()

                        if (response.status === "successful") {
                            setIsProcessing(true)
                            try {
                                const verifyRes = await fetch("/api/payment/verify/flutterwave", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        transaction_id: response.transaction_id,
                                        bootcampId: bootcampId
                                    })
                                })

                                const verifyData = await verifyRes.json()

                                if (verifyData.success) {
                                    toast.success("Payment verified! Redirecting...")
                                    router.push(`/payment/success?bootcampId=${bootcampId}`)
                                } else {
                                    toast.error("Payment verification failed. Please contact support.")
                                }
                            } catch (error) {
                                console.error("Verification error:", error)
                                toast.error("An error occurred verifying your payment. Please contact support.")
                            } finally {
                                setIsProcessing(false)
                            }
                        }
                    },
                    onClose: () => {
                        // Handle modal closed
                    },
                })
            }}
        >
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                </>
            ) : (
                `Pay ₦${amount.toLocaleString()}`
            )}
        </Button>
    )
}
