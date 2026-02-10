import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        console.error("Session error:", error);
        // This usually means invalid cookie, treat as logged out
    }

    return (
        <main className="h-screen w-full flex flex-col items-center justify-center md:justify-start md:pt-56 pt-40 p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute -z-10 left-0 top-0 h-[500px] w-[500px] -translate-x-[30%] -translate-y-[20%] rounded-full bg-primary/5 blur-[100px]"></div>
            <div className="absolute -z-10 right-0 bottom-0 h-[500px] w-[500px] translate-x-[30%] translate-y-[20%] rounded-full bg-blue-400/5 blur-[100px]"></div>
            <div className="absolute -z-10 left-1/2 top-1/2 h-[300px] w-[800px] -translate-x-1/2 -translate-y-1/2 rotate-12 bg-gradient-to-tr from-rose-100/20 to-teal-100/20 blur-[80px]"></div>
            <div className="max-w-6xl w-full text-center space-y-6">
                <h1 className="text-3xl md:text-4xl tracking-[-0.06em] text-foreground">
                    Create the version of you <br /> that never loses.
                </h1>

                <div className="pt-2">
                    <Link
                        href={session ? "/dashboard" : "/auth/signup"}
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-md text-lg font-medium tracking-tight hover:opacity-90 transition-opacity border-[0.5px] border-violet-400"
                    >
                        {session ? "Go To Dashboard" : "Get started"}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
