"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, getProviders } from "next-auth/react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function SignupPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [touchedPassword, setTouchedPassword] = useState(false)
    const [hasGoogleProvider, setHasGoogleProvider] = useState(false)

    useEffect(() => {
        getProviders().then((providers) => {
            if (providers?.google) {
                setHasGoogleProvider(true)
            }
        })
    }, [])

    // Password requirements
    const requirements = [
        { id: 'length', text: 'Min 8 characters', regex: /.{8,}/ },
        { id: 'upper', text: '1 uppercase', regex: /[A-Z]/ },
        { id: 'lower', text: '1 lowercase', regex: /[a-z]/ },
        { id: 'number', text: '1 number', regex: /[0-9]/ },
        { id: 'special', text: '1 special character', regex: /[^A-Za-z0-9]/ },
    ]

    const unmetRequirements = requirements.filter(req => !req.regex.test(password))
    const isPasswordValid = unmetRequirements.length === 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !email || !password) {
            // Should be caught by 'required' attribute, but as a fallback/double-check
            return
        }

        if (!isPasswordValid) return

        setIsLoading(true)

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            })

            if (res.ok) {
                // Sign in immediately after registration
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                })

                if (result?.ok) {
                    router.push("/dashboard")
                    router.refresh()
                } else {
                    console.error("Sign in after registration failed")
                    setIsLoading(false)
                }
            } else {
                const data = await res.json()
                console.error("Registration failed:", data.error)
                setIsLoading(false)
            }
        } catch (error) {
            console.error("An error occurred", error)
            setIsLoading(false)
        }
    }

    const handleGoogleSignup = () => {
        signIn("google", { callbackUrl: "/dashboard" })
    }

    return (
        <div className="min-h-screen flex items-start pt-20 md:items-center md:pt-0 justify-center bg-background px-4 relative">

            <div className="w-full max-w-[400px] space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-zinc-500">
                        Enter your details below to create your account
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Full Name"
                                    type="text"
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white"
                                    required
                                />
                            </div>
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
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        placeholder="Password"
                                        type={showPassword ? "text" : "password"}
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            if (!touchedPassword) setTouchedPassword(true)
                                        }}
                                        className="bg-white pr-10"
                                        required
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

                                {/* Real-time Requirements */}
                                <div className={cn(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    touchedPassword && unmetRequirements.length > 0 ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                                )}>
                                    <ul className="text-xs text-zinc-500 space-y-1 pl-1">
                                        {unmetRequirements.map(req => (
                                            <li key={req.id} className="flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                                                {req.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Button disabled={isLoading || (touchedPassword && !isPasswordValid)} className="w-full">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Account
                            </Button>
                        </div>
                    </form>

                    {hasGoogleProvider && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-zinc-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button variant="outline" type="button" onClick={handleGoogleSignup} disabled={isLoading} className="border-zinc-200 shadow-none">
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 4.61c1.61 0 3.09.56 4.23 1.64l3.18-3.18C17.46 1.05 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </Button>
                        </>
                    )}
                </div>

                <p className="px-8 text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}
