import { notFound } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Check, Users, Video, Calendar } from "lucide-react"

interface Module {
    title: string
    lessons: string[]
}

export const dynamic = "force-dynamic"

export default async function BootcampDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    const bootcamp = await prisma.bootcamp.findUnique({
        where: { slug: slug },
        include: {
            _count: {
                select: { enrollments: true }
            }
        }
    })

    if (!bootcamp) notFound()

    // Check enrollment if logged in (mocking user query for now as session.user.id stub logic in auth.ts is simple)
    // In real implementation:
    let isEnrolled = false
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (user) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_bootcampId: {
                        userId: user.id,
                        bootcampId: bootcamp.id
                    }
                }
            })
            isEnrolled = !!enrollment
        }
    }

    // Parse curriculum
    let curriculum = []
    try {
        curriculum = JSON.parse(bootcamp.curriculum)
    } catch (e) { console.error('Failed to parse curriculum', e) }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero */}
            <div className="bg-white border-b border-zinc-100 pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="mb-6">
                        <BackButton label="Back to Bootcamps" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Cohort
                        </span>
                        {isEnrolled && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Enrolled
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        {bootcamp.title}
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl">
                        {bootcamp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Starts 3rd of March 2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <span>Live on Google Meet</span>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                        {isEnrolled ? (
                            <Button size="lg" disabled className="bg-zinc-100 text-zinc-400 hover:bg-zinc-100 w-full sm:w-auto">
                                You are registered
                            </Button>
                        ) : (
                            <Button size="lg" asChild className="rounded-full px-8 text-lg h-14 w-full sm:w-auto">
                                <Link
                                    href={session
                                        ? `/checkout/${bootcamp.id}`
                                        : `/auth/login?callbackUrl=/checkout/${bootcamp.id}&msg=login_required_registry`
                                    }
                                >
                                    Register Now
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Curriculum */}
            <div className="px-4 py-16">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-2xl font-semibold tracking-tight">Curriculum</h2>
                    <div className="space-y-4">
                        {curriculum.map((module: Module, idx: number) => (
                            <div key={idx} className="border border-zinc-200 rounded-xl p-6 bg-white">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <span className="text-primary/50 font-mono text-sm">0{idx + 1}</span>
                                    {module.title}
                                </h3>
                                <ul className="space-y-2 ml-8">
                                    {module.lessons.map((lesson: string, i: number) => (
                                        <li key={i} className="text-zinc-600 text-sm list-disc">
                                            {lesson}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
