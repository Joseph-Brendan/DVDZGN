import { BackButton } from "@/components/ui/back-button"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background pt-24 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <BackButton label="Home" href="/" />
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
                    <p className="text-xl text-zinc-600 leading-relaxed mb-6">
                        Have questions? reach out to us directly.
                    </p>
                    <a href="mailto:learn@devdesignhq.com" className="bg-primary text-white px-6 py-3 rounded-full font-medium inline-block hover:opacity-90">
                        Email Us
                    </a>
                </div>
            </div>
        </div>
    )
}
