"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
                    toast.success("Account created successfully!")
                    router.push("/dashboard")
                    router.refresh()
                } else {
                    toast.error("Account created, but auto-login failed. Please log in manually.")
                    setIsLoading(false)
                }
            } else {
                const data = await res.json()
                toast.error(data.error || "Registration failed. Please try again.")
                setIsLoading(false)
            }
        } catch (error) {
            console.error("An error occurred", error)
            toast.error("Something went wrong. Please try again.")
            setIsLoading(false)
        }
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
                                    onBlur={() => {
                                        if (email.length > 5 && email.includes('@')) {
                                            toast.info("Please confirm your email is spelt correctly", {
                                                duration: 5000,
                                            })
                                        }
                                    }}
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
