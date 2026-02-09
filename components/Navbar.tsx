"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Hide navbar on auth pages if desired, but user asked for "across all pages"
    // Usually clean auth pages are better, but let's stick to "across all pages" or maybe just minimal on auth.
    // Let's keep it simple for now and show everywhere.

    const isHome = pathname === "/"
    const isAuth = pathname?.startsWith("/auth")

    const navClasses = isHome
        ? "fixed top-0 w-full z-50 bg-transparent border-none"
        : `sticky top-0 z-50 bg-white ${isAuth ? "border-none" : "border-b border-zinc-100"}`

    return (
        <nav className={`${navClasses} transition-all`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-[1rem] font-semibold tracking-tighter text-zinc-900">
                            Dev and Design
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <Link href="/bootcamps" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                            Bootcamps
                        </Link>

                        {session ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                    Dashboard
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-sm font-medium text-zinc-500 hover:text-red-600"
                                >
                                    Logout
                                </Button>
                                <div className="px-3 py-1.5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                    Welcome, {session.user?.name?.split(" ")[0] || "User"}
                                </div>
                            </>
                        ) : (
                            pathname !== "/auth/login" && (
                                <Link href="/auth/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                    Login
                                </Link>
                            )
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            {isMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-zinc-100 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            href="/bootcamps"
                            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Bootcamps
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        signOut({ callbackUrl: "/" })
                                        setIsMenuOpen(false)
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            pathname !== "/auth/login" && (
                                <Link
                                    href="/auth/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
