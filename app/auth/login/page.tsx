"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showEmailHint, setShowEmailHint] = useState(false)

    // Google provider check removed

    useEffect(() => {
        if (showEmailHint) {
            const timer = setTimeout(() => {
                setShowEmailHint(false)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [showEmailHint])

    useEffect(() => {
        const msg = searchParams.get("msg")
        if (msg === "login_required_registry") {
            // Small timeout to ensure toaster is ready
            setTimeout(() => {
                toast.error("You have to be signed in to register")
            }, 0)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Using NextAuth credentials provider
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            // Handle error (toast or inline)
            console.error(result.error)
            toast.error("Invalid email or password")
        } else {
            toast.success("Login successful")
            const callbackUrl = searchParams.get("callbackUrl")
            router.push(callbackUrl || "/dashboard")
            router.refresh()
        }

        setIsLoading(false)
    }




    return (
        <div className="min-h-screen flex items-start pt-20 md:items-center md:pt-0 justify-center bg-background px-4 relative">

            <div className="w-full max-w-[400px] space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-zinc-500">
                        sign in to your account
                    </p>
                </div>

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
                                    onBlur={() => {
                                        if (email.length > 5 && email.includes('@')) {
                                            setShowEmailHint(true)
                                        }
                                    }}
                                    className="bg-white"
                                />
                                {showEmailHint && (
                                    <p className="text-xs text-primary font-medium animate-in fade-in slide-in-from-top-1">
                                        We hope you spelt your email correctly
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        placeholder="Password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white pr-10"
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
                            <div className="flex items-center justify-end">
                                <Link
                                    href="/auth/reset-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Button disabled={isLoading} className="w-full">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>
                        </div>
                    </form>
                </div>

                <p className="px-8 text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/auth/signup"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
