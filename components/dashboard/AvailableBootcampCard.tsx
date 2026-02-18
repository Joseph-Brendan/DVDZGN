"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Check, Loader2 } from "lucide-react"

interface AvailableBootcampCardProps {
    bootcamp: {
        id: string
        title: string
        slug: string
        isActive: boolean
    }
}

export function AvailableBootcampCard({ bootcamp }: AvailableBootcampCardProps) {
    const [isOnWaitlist, setIsOnWaitlist] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    // Check if already on waitlist on mount
    useEffect(() => {
        async function checkWaitlist() {
            try {
                const res = await fetch(`/api/waitlist?bootcampId=${bootcamp.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setIsOnWaitlist(data.onWaitlist)
                }
            } catch (error) {
                console.error("Failed to check waitlist status:", error)
            } finally {
                setIsChecking(false)
            }
        }
        checkWaitlist()
    }, [bootcamp.id])

    const handleJoinWaitlist = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bootcampId: bootcamp.id })
            })

            const data = await res.json()

            if (res.ok) {
                setIsOnWaitlist(true)
            } else if (res.status === 409) {
                // Already on waitlist
                setIsOnWaitlist(true)
            } else {
                console.error("Waitlist error:", data.error)
            }
        } catch (error) {
            console.error("Failed to join waitlist:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="group relative rounded-2xl border border-zinc-100 bg-gradient-to-b from-zinc-50/80 to-white overflow-hidden transition-all duration-300 hover:border-zinc-200">
            {/* Muted accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200" />
            <div className="p-6">
                <div className="mb-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                    </span>
                </div>
                <h4 className="text-lg font-semibold text-zinc-400 mb-1 tracking-tight">{bootcamp.title}</h4>
                <p className="text-sm text-zinc-300 mb-6">Details will be announced soon</p>

                {isChecking ? (
                    <Button variant="outline" className="w-full rounded-lg shadow-none border-zinc-200 bg-zinc-50" disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                    </Button>
                ) : isOnWaitlist ? (
                    <Button variant="outline" className="w-full rounded-lg shadow-none border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 cursor-default" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Waitlist Joined
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full rounded-lg shadow-none border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                        onClick={handleJoinWaitlist}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Joining...
                            </>
                        ) : (
                            "Join Waitlist"
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
