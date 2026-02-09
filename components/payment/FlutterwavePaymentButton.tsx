"use client"

import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "", // Use env var placeholder
        tx_ref: Date.now().toString(),
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
            logo: "https://your-logo-url.com", // TODO: Replace with actual logo URL
        },
    }

    const handleFlutterwavePayment = useFlutterwave(config)

    return (
        <Button
            className="w-full h-12 text-base"
            onClick={() => {
                handleFlutterwavePayment({
                    callback: async (response) => {
                        console.log(response)
                        closePaymentModal() // Close modal programmatically

                        if (response.status === "successful") {
                            // Verify transaction on backend
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
                                    // Redirect to success page
                                    router.push(`/payment/success?bootcampId=${bootcampId}`)
                                } else {
                                    alert("Payment verification failed. Please contact support.")
                                }
                            } catch (error) {
                                console.error("Verification error:", error)
                                alert("An error occurred verifying your payment.")
                            }
                        }
                    },
                    onClose: () => {
                        // Handle modal closed
                    },
                })
            }}
        >
            Pay ₦{amount.toLocaleString()}
        </Button>
    )
}
