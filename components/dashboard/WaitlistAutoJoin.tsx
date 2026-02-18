"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function WaitlistAutoJoin() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const hasJoined = useRef(false)

    useEffect(() => {
        const bootcampId = searchParams.get("joinWaitlist")
        if (!bootcampId || hasJoined.current) return

        hasJoined.current = true

        async function joinWaitlist() {
            try {
                const res = await fetch("/api/waitlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bootcampId })
                })

                if (res.ok) {
                    toast.success("Waitlist joined", { duration: 7000 })
                } else if (res.status === 409) {
                    toast.success("Waitlist joined", { duration: 7000 })
                } else {
                    const data = await res.json()
                    toast.error(data.error || "Failed to join waitlist")
                }
            } catch (error) {
                console.error("Auto-join waitlist failed:", error)
                toast.error("Failed to join waitlist")
            }

            // Clean the URL
            router.replace("/dashboard", { scroll: false })
        }

        joinWaitlist()
    }, [searchParams, router])

    return null
}
