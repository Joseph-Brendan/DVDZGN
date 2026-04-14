import { HeroCTA } from "@/components/HeroCTA";

export default function Home() {
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
                    <HeroCTA />
                </div>
            </div>
        </main>
    );
}
