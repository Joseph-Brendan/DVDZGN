import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BootcampsPage() {
    const bootcamps = await prisma.bootcamp.findMany({
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="space-y-4 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Live Bootcamps
                    </h1>
                    <p className="text-lg text-zinc-500">
                        Intensive, live cohorts designed to take you from zero to industry-ready.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 items-center">
                    {bootcamps.map((bootcamp) => {
                        if (!bootcamp.isActive) {
                            return (
                                <div
                                    key={bootcamp.id}
                                    className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-all w-full max-w-[400px] opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:border-zinc-300"
                                >
                                    <div className="mb-4">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                                            Coming Soon
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-zinc-500">
                                        {bootcamp.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                                        <Calendar className="h-4 w-4" />
                                        <span>Dates to be announced</span>
                                    </div>

                                    <p className="text-zinc-400 mb-6 line-clamp-3 text-sm flex-1">
                                        {bootcamp.description}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-zinc-400">
                                                ₦{bootcamp.priceNGN.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-zinc-300">
                                                or ${bootcamp.priceUSD}
                                            </span>
                                        </div>
                                        <Button size="sm" className="rounded-full" disabled variant="outline">
                                            Join Waitlist
                                        </Button>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={bootcamp.id}
                                href={`/bootcamps/${bootcamp.slug}`}
                                className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-primary/50 w-full max-w-[400px]"
                            >
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        Live Cohort
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                    {bootcamp.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                                    <Calendar className="h-4 w-4" />
                                    <span>Starts 30th of March 2026</span>
                                </div>

                                <p className="text-zinc-500 mb-6 line-clamp-3 text-sm flex-1">
                                    {bootcamp.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-zinc-900">
                                            ₦{bootcamp.priceNGN.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            or ${bootcamp.priceUSD}
                                        </span>
                                    </div>
                                    <Button asChild size="sm" className="rounded-full">
                                        <span>
                                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                                        </span>
                                    </Button>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
