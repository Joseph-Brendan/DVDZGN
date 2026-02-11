"use client"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function StripePaymentForm({ amount, bootcampId }: { amount: number; bootcampId: string }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setIsLoading(true)
        setErrorMessage(null)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success?bootcampId=${bootcampId}`,
            },
        })

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.")
            setIsLoading(false)
        } else {
            // The UI will likely redirect before this runs
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
            )}
            <Button disabled={!stripe || isLoading} className="w-full h-12 text-base mt-4">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay $${amount}`
                )}
            </Button>
        </form>
    )
}
