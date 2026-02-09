"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, ArrowRight, ExternalLink, Share2, Mail, MessageSquare, Linkedin, X } from "lucide-react"
import { Bootcamp } from "@prisma/client"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"

interface EnrolledCourseCardProps {
    bootcamp: Bootcamp
}

export function EnrolledCourseCard({ bootcamp }: EnrolledCourseCardProps) {
    const searchParams = useSearchParams()
    const isNewEnrollment = searchParams.get("new_enrollment") === "true" && searchParams.get("bootcampId") === bootcamp.id
    const [isContactRevealed, setIsContactRevealed] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Hardcoded details for now as per request
    const classTime = "7:00 PM - 9:00 PM WAT"

    const duration = "8 Weeks"
    const platform = "Google Meet"
    const discordLink = "https://discord.gg/your-invite-link" // Replace with actual link
    const contactEmail = "learn@devdesignhq.com" // Replace with actual email

    const startDate = bootcamp.startDate ? new Date(bootcamp.startDate) : new Date()
    const isStarted = new Date() >= startDate

    const handleJoinClass = () => {
        if (isStarted) {
            // In a real app, this would redirect to the actual Google Meet URL
            window.open("https://meet.google.com/xyz-abc-def", "_blank")
        } else {
            setIsDialogOpen(true)
        }
    }

    const handleShare = (platform: 'twitter' | 'linkedin') => {
        const text = `I just enrolled in the ${bootcamp.title} at Dev and Design! Join me to learn magic! 🚀`
        const url = window.location.origin + `/bootcamps/${bootcamp.slug}`

        let shareUrl = ''
        if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        } else if (platform === 'linkedin') {
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` // LinkedIn simplified sharing
        }

        window.open(shareUrl, '_blank')
    }

    return (
        <>
            <div className="group rounded-2xl border border-zinc-200 bg-white transition-all hover:border-primary/50 hover:shadow-sm">
                {/* Header/Banner Section */}
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 rounded-t-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 mb-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Enrolled
                            </span>
                            <h3 className="text-xl font-bold text-zinc-900 leading-tight">{bootcamp.title}</h3>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="relative">
                                    {isNewEnrollment && (
                                        <div className="absolute -top-12 -right-4 w-40 bg-primary text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg dark:shadow-none animate-bounce text-center z-10 after:content-[''] after:absolute after:top-full after:right-6 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-primary">
                                            Share the good news!
                                        </div>
                                    )}
                                    <Button variant="ghost" size="icon" className={`h-8 w-8 text-zinc-400 hover:text-zinc-600 ${isNewEnrollment ? 'animate-pulse text-primary ring-2 ring-primary ring-offset-2 rounded-full bg-primary/10' : ''}`}>
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                                    Share on X
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                                    Share on LinkedIn
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid gap-6 sm:grid-cols-2 rounded-b-2xl">

                    {/* Time & Detailed Info */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Class Time</p>
                                <p className="text-sm text-zinc-500">{classTime}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{duration}</p>
                            </div>
                        </div>



                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Community</p>
                                <a
                                    href={discordLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    Join Discord Server <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Platform & Actions */}
                    <div className="space-y-4 flex flex-col justify-between">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Platform</p>
                                <p className="text-sm text-zinc-500">Live on {platform}</p>
                            </div>
                        </div>

                        <div className="pt-2 space-y-3">
                            <Button
                                className="w-full gap-2 shadow-none"
                                onClick={handleJoinClass}
                                variant={isStarted ? "default" : "secondary"}
                            >
                                Join Live Class
                                {isStarted && <ArrowRight className="w-4 h-4" />}
                            </Button>

                            <div className="text-left">
                                {!isContactRevealed ? (
                                    <button
                                        onClick={() => setIsContactRevealed(true)}
                                        className="text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1"
                                    >
                                        <Mail className="w-3 h-3" /> Contact Team
                                    </button>
                                ) : (
                                    <p className="text-xs text-zinc-600 animate-in fade-in slide-in-from-bottom-1">
                                        Email: <a href={`mailto:${contactEmail}`} className="text-primary hover:underline font-medium">{contactEmail}</a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bootcamp Has Not Started</DialogTitle>
                        <DialogDescription>
                            This bootcamp is scheduled to start on <span className="font-medium text-zinc-900">{startDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>.
                            <br /><br />
                            We look forward to seeing you there! In the meantime, please check your email for onboarding materials.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
