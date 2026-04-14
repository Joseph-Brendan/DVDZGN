import { Loader2 } from "lucide-react"

export default function BootcampsLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-zinc-400 font-medium">Loading bootcamps...</p>
            </div>
        </div>
    )
}
