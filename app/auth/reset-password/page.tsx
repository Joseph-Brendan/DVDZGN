"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"


export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase() }),
            })

            if (!res.ok) {
                toast.error("Something went wrong. Please try again.")
            } else {
                setIsSubmitted(true)
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
            <div className="w-full max-w-[400px] space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
                    <p className="text-sm text-zinc-500">
                        Enter your email address and we&apos;ll send you a link to reset your password
                    </p>
                </div>

                {!isSubmitted ? (
                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white"
                                        required
                                    />
                                </div>
                                <Button disabled={isLoading} className="w-full">
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm">
                            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Try another email
                        </Button>
                    </div>
                )}

                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="text-sm text-zinc-500 hover:text-zinc-900 font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
