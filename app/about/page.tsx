import { BackButton } from "@/components/ui/back-button"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background pt-24 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <BackButton label="Home" href="/" />
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">About Dev and Design</h1>
                    <p className="text-xl text-zinc-600 leading-relaxed">
                        We are a community-driven platform dedicated to helping you master the art of development and design.
                        Our bootcamps are designed to take you from a beginner to a job-ready professional.
                    </p>
                </div>
            </div>
        </div>
    )
}
