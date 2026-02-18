import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar, ArrowRight, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"

import { EnrolledCourseCard } from "@/components/dashboard/EnrolledCourseCard"
import { AvailableBootcampCard } from "@/components/dashboard/AvailableBootcampCard"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login")
    }

    const userEnrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            bootcamp: true
        }
    })

    const allBootcamps = await prisma.bootcamp.findMany({
        orderBy: { createdAt: "desc" }
    })

    const enrolledBootcampIds = new Set(userEnrollments.map(e => e.bootcampId))
    const availableBootcamps = allBootcamps.filter(b => !enrolledBootcampIds.has(b.id))

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* My Bootcamps Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            My Bootcamps
                        </h2>
                    </div>

                    {userEnrollments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-200 p-12 text-center bg-zinc-50/50">
                            <h3 className="text-lg font-medium text-zinc-900 mb-2">
                                You are not a member of any bootcamp yet.
                            </h3>
                            <div className="flex flex-col items-center gap-4 mt-6">
                                <Button asChild size="lg">
                                    <Link href="/bootcamps">Register for Bootcamp</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                            {userEnrollments.map((enrollment) => (
                                <EnrolledCourseCard key={enrollment.id} bootcamp={enrollment.bootcamp} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Available Bootcamps */}
                {availableBootcamps.length > 0 && (
                    <section className="pt-8 border-t border-zinc-100">
                        <h3 className="text-lg font-medium mb-4">Available Bootcamps</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {availableBootcamps.map((bootcamp) => {
                                if (!bootcamp.isActive) {
                                    return (
                                        <AvailableBootcampCard key={bootcamp.id} bootcamp={bootcamp} />
                                    )
                                }

                                return (
                                    <div key={bootcamp.id} className="group relative rounded-2xl border border-zinc-200/70 bg-gradient-to-b from-white to-zinc-50/50 overflow-hidden transition-all duration-300 hover:border-primary/30">
                                        {/* Gradient accent bar */}
                                        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-300 group-hover:h-1.5" />
                                        <div className="p-6">
                                            <div className="mb-5">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary tracking-wide uppercase">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                                    </span>
                                                    Live Cohort
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-semibold text-zinc-900 mb-1 tracking-tight group-hover:text-primary transition-colors duration-300">{bootcamp.title}</h4>
                                            <p className="text-sm text-zinc-500 mb-6">Enroll now and start learning</p>
                                            <Button className="w-full rounded-lg gap-2 shadow-none transition-all duration-300" asChild>
                                                <Link href={`/bootcamps/${bootcamp.slug}`}>
                                                    View Details
                                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
