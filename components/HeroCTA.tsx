"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowRight } from "lucide-react"

export function HeroCTA() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-md text-lg font-medium tracking-tight opacity-70 border-[0.5px] border-violet-400">
                <span className="animate-pulse">Loading...</span>
            </div>
        )
    }

    return (
        <Link
            href={session ? "/dashboard" : "/auth/signup"}
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-md text-lg font-medium tracking-tight hover:opacity-90 transition-opacity border-[0.5px] border-violet-400"
        >
            {session ? "Go To Dashboard" : "Get started"}
            <ArrowRight className="w-5 h-5" />
        </Link>
    )
}
