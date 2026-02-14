"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
    className?: string
    variant?: "default" | "ghost" | "outline" | "secondary"
    label?: string
    href?: string
}

export function BackButton({ className, variant = "ghost", label = "Back", href }: BackButtonProps) {
    const router = useRouter()

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={() => href ? router.push(href) : router.back()}
            className={cn("gap-2 group", className)}
        >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {label}
        </Button>
    )
}
