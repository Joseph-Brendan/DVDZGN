import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SuccessClient from "./SuccessClient"

export const dynamic = "force-dynamic"

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
        }>
            <SuccessClient />
        </Suspense>
    )
}
