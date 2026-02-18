"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"

interface WaitlistButtonProps {
    bootcampId: string
}

export function WaitlistButton({ bootcampId }: WaitlistButtonProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isOnWaitlist, setIsOnWaitlist] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    // Check waitlist status if logged in
    useEffect(() => {
        if (status === "loading") return

        if (!session) {
            setIsChecking(false)
            return
        }

        async function checkWaitlist() {
            try {
                const res = await fetch(`/api/waitlist?bootcampId=${bootcampId}`)
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
    }, [bootcampId, session, status])

    const handleClick = async () => {
        // If not logged in, redirect to login with waitlist params
        if (!session) {
            const callbackUrl = `/dashboard?joinWaitlist=${bootcampId}`
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}&msg=login_required_waitlist`)
            return
        }

        // If logged in, join waitlist directly
        setIsLoading(true)
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bootcampId })
            })

            if (res.ok || res.status === 409) {
                setIsOnWaitlist(true)
            }
        } catch (error) {
            console.error("Failed to join waitlist:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isChecking) {
        return (
            <Button size="sm" className="rounded-full" disabled variant="outline">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Loading...
            </Button>
        )
    }

    if (isOnWaitlist) {
        return (
            <Button size="sm" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 cursor-default shadow-none" disabled variant="outline">
                <Check className="h-3 w-3 mr-1" />
                Waitlist Joined
            </Button>
        )
    }

    return (
        <Button
            size="sm"
            className="rounded-full shadow-none"
            variant="outline"
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Joining...
                </>
            ) : (
                "Join Waitlist"
            )}
        </Button>
    )
}
