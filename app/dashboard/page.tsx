import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar, ArrowRight } from "lucide-react"
import { redirect } from "next/navigation"

import { EnrolledCourseCard } from "@/components/dashboard/EnrolledCourseCard"

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
                                        <div key={bootcamp.id} className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300">
                                            <div className="mb-4">
                                                <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                                                    Coming Soon
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-semibold mb-4 text-zinc-500">{bootcamp.title}</h4>
                                            <Button variant="outline" className="w-full text-zinc-400 border-zinc-200 hover:bg-transparent hover:text-zinc-400 cursor-not-allowed" disabled>
                                                Join Waitlist
                                            </Button>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={bootcamp.id} className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-primary/50">
                                        <div className="mb-4">
                                            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                Live Cohort
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-semibold mb-4">{bootcamp.title}</h4>
                                        <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary" asChild>
                                            <Link href={`/bootcamps/${bootcamp.slug}`}>View Details</Link>
                                        </Button>
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
