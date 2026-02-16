"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Mail, LogOut } from "lucide-react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

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
                        {(session || !pathname?.startsWith("/bootcamps")) && (
                            <Link href="/bootcamps" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                Bootcamps
                            </Link>
                        )}

                        {session ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                    Dashboard
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="px-3 py-1.5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs hover:bg-primary/20 transition-colors focus:outline-none">
                                            Welcome, {session.user?.name?.split(" ")[0] || "User"}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <a href="mailto:learn@devdesignhq.com" className="cursor-pointer">
                                                <Mail className="mr-2 h-4 w-4" />
                                                <span>Contact Us</span>
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onSelect={() => signOut({ callbackUrl: "/" })}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Sign Out</span>
                                        </DropdownMenuItem>

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            pathname !== "/auth/login" && (
                                <Link href="/auth/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                    Sign In
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
                        {(session || !pathname?.startsWith("/bootcamps")) && (
                            <Link
                                href="/bootcamps"
                                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Bootcamps
                            </Link>
                        )}
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
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>
                </div>
            )}

        </nav>
    )
}
