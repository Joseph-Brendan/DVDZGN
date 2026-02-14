import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import CheckoutForm from "./CheckoutForm"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ params }: { params: Promise<{ bootcampId: string }> }) {
    const { bootcampId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect(`/auth/login?callbackUrl=/checkout/${bootcampId}&msg=login_required_registry`)
    }


    // Fetch bootcamp details
    const bootcamp = await prisma.bootcamp.findUnique({
        where: { id: bootcampId }
    })

    if (!bootcamp) notFound()

    // Check if user is already enrolled
    // IMPORTANT: Make sure we have the user ID from the session first.
    // Ideally session.user.id is available. If not, fetch user by email.
    let userId = session.user.id
    if (!userId && session.user.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (user) userId = user.id
    }

    if (userId) {
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_bootcampId: {
                    userId: userId,
                    bootcampId: bootcampId
                }
            }
        })

        if (existingEnrollment) {
            return (
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center space-y-6">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-zinc-900">Already Registered</h1>
                            <p className="text-zinc-500">
                                You are already enrolled in <strong>{bootcamp.title}</strong>.
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/dashboard">
                                Go to Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        }
    }

    // Geolocation for currency
    const headersList = await headers()
    const country = headersList.get("x-vercel-ip-country")

    // Default to NG (Naira), only switch to INTL (USD) if confirmed outside Nigeria
    const region = (country && country !== "NG") ? "INTL" : "NG"

    // Fetch full user details for payment providers
    if (!userId) {
        redirect(`/auth/login?callbackUrl=/checkout/${bootcampId}`)
    }

    // Fetch full user details for payment providers
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        redirect(`/auth/login?callbackUrl=/checkout/${bootcampId}`)
    }

    return (
        <CheckoutForm
            bootcampId={bootcampId}
            title={bootcamp.title}
            priceNGN={bootcamp.priceNGN}
            priceUSD={bootcamp.priceUSD}
            type="live"
            initialRegion={region}
            userEmail={user.email!}
            userName={user.name!}
        />
    )
}
