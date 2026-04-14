"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PaymentRecoveryPage() {
    const [transactionId, setTransactionId] = useState("")
    const [bootcampId, setBootcampId] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [result, setResult] = useState<"success" | "failed" | null>(null)
    const [errorMsg, setErrorMsg] = useState("")

    const handleRecover = async () => {
        if (!transactionId.trim()) {
            toast.error("Please enter your transaction ID")
            return
        }

        setIsVerifying(true)
        setResult(null)
        setErrorMsg("")

        try {
            const res = await fetch("/api/payment/verify/flutterwave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transaction_id: transactionId.trim(),
                    bootcampId: bootcampId.trim() || undefined,
                })
            })

            const data = await res.json()

            if (data.success) {
                setResult("success")
                toast.success("Payment verified and enrollment confirmed!")
            } else {
                setResult("failed")
                setErrorMsg(data.error || "Verification failed. Please contact support.")
            }
        } catch {
            setResult("failed")
            setErrorMsg("Network error. Please try again.")
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h1 className="text-xl font-semibold mb-1">Payment Recovery</h1>
                    <p className="text-sm text-zinc-500">
                        If you made a payment but weren&apos;t enrolled, enter your Flutterwave transaction ID below to recover your enrollment.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {result === "success" ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="mx-auto h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900">Enrollment Confirmed!</h2>
                                <p className="text-sm text-zinc-500 mt-1">Your payment has been verified and you are now enrolled.</p>
                            </div>
                            <Button asChild className="w-full gap-2">
                                <Link href="/dashboard">
                                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : result === "failed" ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="mx-auto h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-7 w-7 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900">Verification Failed</h2>
                                <p className="text-sm text-zinc-500 mt-1">{errorMsg}</p>
                            </div>
                            <div className="space-y-2">
                                <Button onClick={() => { setResult(null); setErrorMsg("") }} variant="outline" className="w-full">
                                    Try Again
                                </Button>
                                <p className="text-xs text-zinc-400">
                                    If this keeps happening, email <a href="mailto:learn@devdesignhq.com" className="text-primary hover:underline">learn@devdesignhq.com</a> with your transaction ID.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">
                                    Transaction ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="e.g. 1234567890"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <p className="text-xs text-zinc-400">You can find this in your Flutterwave payment receipt email.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">
                                    Bootcamp ID <span className="text-zinc-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={bootcampId}
                                    onChange={(e) => setBootcampId(e.target.value)}
                                    placeholder="Leave blank if unsure"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <Button
                                className="w-full h-11"
                                onClick={handleRecover}
                                disabled={isVerifying || !transactionId.trim()}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Payment"
                                )}
                            </Button>

                            <div className="text-center pt-2">
                                <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-primary transition-colors">
                                    Back to Dashboard
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
