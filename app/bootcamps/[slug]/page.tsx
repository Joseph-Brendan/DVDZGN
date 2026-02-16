import { notFound } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Check, Users, Video, Calendar, Clock } from "lucide-react"

interface Module {
    title: string
    lessons?: string[]
    description?: string
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
    let curriculum: Module[] = []
    try {
        curriculum = JSON.parse(bootcamp.curriculum)
    } catch (e) { console.error('Failed to parse curriculum', e) }

    const prerequisite = curriculum.find((m: Module) => m.title.toLowerCase().includes('prerequisite'))
    const weeks = curriculum.filter((m: Module) => !m.title.toLowerCase().includes('prerequisite'))


    return (
        <div className="min-h-screen bg-background pb-20">
            {/* ... Hero section unchanged ... */}
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
                            <span>Starts 30th of March 2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Duration: 6 Weeks</span>
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
                                        : `/auth/signup?callbackUrl=/checkout/${bootcamp.id}&bootcampId=${bootcamp.id}`
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

                    {prerequisite && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
                            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-1">Prerequisite</h3>
                            <p className="text-amber-700 text-sm">
                                {prerequisite.description}
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {weeks.map((module: Module, idx: number) => (
                            <div key={idx} className="group border border-zinc-200 rounded-2xl p-6 bg-white hover:border-zinc-300 transition-colors">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-3">
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 text-zinc-500 font-mono text-xs font-medium">
                                        0{idx + 1}
                                    </span>
                                    {module.title}
                                </h3>

                                {module.description && (
                                    <div className="text-zinc-600 text-sm leading-relaxed mb-6 pl-11 whitespace-pre-line border-l-2 border-zinc-100 ml-4 py-1 opacity-90">
                                        {module.description}
                                    </div>
                                )}

                                {module.lessons && module.lessons.length > 0 && (
                                    <div className="pl-11">
                                        <ul className="grid sm:grid-cols-2 gap-3">
                                            {module.lessons.map((lesson: string, i: number) => (
                                                <li key={i} className="text-zinc-600 text-sm flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 mt-1.5 flex-shrink-0" />
                                                    {lesson}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
