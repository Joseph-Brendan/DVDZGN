"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SuccessClient() {
    const searchParams = useSearchParams()
    const bootcampId = searchParams.get("bootcampId")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Brief loading state for UX
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm text-center p-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-zinc-900">Finalizing Enrollment...</h2>
                        <p className="text-zinc-500 mt-2">Please wait while we set up your dashboard.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful!</h1>
                        <p className="text-zinc-600 mb-8 max-w-sm">
                            You have successfully enrolled in the bootcamp. A receipt has been sent to your email.
                        </p>

                        <div className="space-y-3 w-full">
                            <Button asChild className="w-full h-11 text-base gap-2" size="lg">
                                <Link href={`/dashboard?new_enrollment=true&bootcampId=${bootcampId}`}>
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full h-11">
                                <Link href="/">Return Home</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
