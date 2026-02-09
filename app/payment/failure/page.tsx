import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function FailurePage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 p-3">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Payment Failed</h1>
                    <p className="text-zinc-500">
                        Something went wrong with your transaction. Please try again.
                    </p>
                </div>
                <div className="pt-4">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/bootcamps">Return to Bootcamps</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
