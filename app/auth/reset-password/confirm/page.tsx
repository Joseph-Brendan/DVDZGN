"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function ConfirmResetForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-[400px] space-y-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Invalid Reset Link</h1>
                    <p className="text-sm text-zinc-500">
                        This reset link is invalid or has expired.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/auth/reset-password">Request a New Link</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setIsSuccess(true)
                toast.success("Password reset successfully!")
            } else {
                toast.error(data.error || "Failed to reset password")
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-[400px] space-y-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Password Reset!</h1>
                    <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm">
                        Your password has been updated successfully.
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => router.push("/auth/login")}
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-[400px] space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Set New Password</h1>
                    <p className="text-sm text-zinc-500">
                        Enter your new password below
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        placeholder="At least 8 characters"
                                        type={showPassword ? "text" : "password"}
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white pr-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    placeholder="Confirm your password"
                                    type={showPassword ? "text" : "password"}
                                    disabled={isLoading}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-white"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <Button disabled={isLoading} className="w-full">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </div>

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

export default function ConfirmResetPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
            <ConfirmResetForm />
        </Suspense>
    )
}
