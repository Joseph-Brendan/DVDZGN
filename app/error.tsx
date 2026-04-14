"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Global error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 text-center space-y-6">
                <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-zinc-900">Something went wrong</h1>
                    <p className="text-zinc-500 text-sm">
                        An unexpected error occurred. Please try again or contact support if the issue persists.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-zinc-400 font-mono">Error ID: {error.digest}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Button onClick={reset} className="w-full">
                        Try Again
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
