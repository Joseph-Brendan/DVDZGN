import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const curriculum = [
        {
            title: "Prerequisite",
            description: "No prior design or coding experience needed. Students should have a laptop, stable internet, and free accounts on Figma, Claude, Gemini, and GitHub before the first session."
        },
        {
            title: "Week 1: Visual Design Principles & Figma Fundamentals",
            description: "Learn to see like a designer. Master the foundational principles of visual design and get hands-on with Figma from day one.",
            lessons: [
                "The four pillars of visual design: hierarchy, contrast, alignment, proximity",
                "Real-world teardown: analysing well-designed apps",
                "Introduction to Figma: frames, layers, and navigation",
                "Typography fundamentals: font pairing, scale, weight, line height",
                "Color theory essentials: primary, secondary, accent, neutrals",
                "Building a color palette from scratch",
                "Accessibility basics: contrast ratios and readable font sizes",
                "Grid systems: columns, gutters, margins",
                "The 8px spacing system and responsive mobile-first design",
                "Visual rhythm and white space as a design tool"
            ]
        },
        {
            title: "Week 2: Design Systems & Component Thinking",
            description: "Build a real design system from scratch. Learn atomic design thinking, create reusable components with variants and Auto Layout, and assemble them into full interactive screens.",
            lessons: [
                "Design systems explained: the single source of truth",
                "Tokens deep dive: colour, typography, spacing, and border-radius variables",
                "Figma styles vs. variables: when to use which",
                "Atomic design: from atoms to molecules to organisms",
                "Building buttons (primary, secondary, ghost) with states",
                "Building input fields with labels, placeholders, and error states",
                "Auto Layout mastery: responsive, flexible components",
                "Variants and component properties in Figma",
                "Assembling components into full page layouts",
                "Prototyping basics: linking screens, transitions, interactions"
            ]
        },
        {
            title: "Week 3: Designing Real Products & Preparing for Code",
            description: "Apply everything to a real product. Move from user problems to wireframes to polished high-fidelity screens, then prepare your designs for AI-assisted development.",
            lessons: [
                "User-centred thinking: from problem to user to solution to screen",
                "Sketching and wireframing: speed over perfection",
                "Information architecture: what goes where and why",
                "User flows: mapping the critical path",
                "Turning wireframes into polished high-fidelity UI",
                "Icon systems: Lucide, Phosphor, and icon libraries in Figma",
                "Imagery and illustrations: Unsplash, Undraw, and best practices",
                "The Figma Inspect panel: understanding CSS values",
                "Exporting assets: SVG for icons, PNG/WebP for images",
                "Screenshot-based handoff: preparing designs for AI prompting"
            ]
        },
        {
            title: "Week 4: AI Foundations & Prompting as a Superpower",
            description: "Understand the AI landscape and master the art of prompting. Learn to use Claude, Gemini, and DeepSeek as your design and development partners.",
            lessons: [
                "Demystifying AI: LLMs explained in plain language",
                "The AI landscape: Claude, Gemini, DeepSeek and when to use each",
                "Agentic AI: what agents mean for builders",
                "Solving the same task with 3 models and comparing outputs",
                "Anatomy of a great prompt: context, role, task, constraints, output format",
                "Prompting patterns: descriptive, reference-based, iterative, and debugging",
                "Common prompting mistakes and how to fix them",
                "Context files and project memory: why AI forgets and how to fix it",
                "Writing system prompts for consistent AI behaviour",
                "Rules files: .cursorrules, .windsurfrules, bolt instructions"
            ]
        },
        {
            title: "Week 5: Product Requirements & IDE Setup",
            description: "Write a complete Product Requirements Document that AI can execute against, set up your vibecoding toolkit, and learn agentic workflows for product development.",
            lessons: [
                "The PRD: your AI's blueprint for building",
                "PRD structure: objectives, users, features, specs, tech requirements",
                "Writing PRDs that AI models can execute with specificity and clarity",
                "IDE tour: Bolt.new, Windsurf, and Cursor",
                "Understanding the file system: HTML, CSS, JS, and config files",
                "GitHub & GitHub Desktop: version control as save points",
                "Agentic workflows: single-shot vs. multi-step development",
                "Multi-model workflows: routing tasks to the right AI",
                "Context chaining: passing outputs between agents",
                "Breaking a PRD into executable development tasks"
            ]
        },
        {
            title: "Week 6: Building with AI, Design to Working Code",
            description: "Start vibecoding. Turn your Figma designs into working pages and components using AI, then add interactivity, navigation, and state management, all through prompts.",
            lessons: [
                "The vibecoding mindset: describe what you want, not how to code it",
                "Workflow: from Figma screenshot to context file to prompt to working component",
                "Using design system tokens in prompts (colours, fonts, spacing)",
                "Bolt.new deep dive: building full-page layouts from screenshots",
                "Iterative prompting: building and composing components",
                "Handling responsive design through prompts",
                "Debugging with AI: the screenshot to fix prompt cycle",
                "What 'state' means: the app remembering things",
                "Prompting for behaviour: forms, toggles, tabs, modals, navigation",
                "Windsurf's Cascade agent for multi-file changes"
            ]
        },
        {
            title: "Week 7: Backend, Database & Deployment",
            description: "Give your app a brain with Supabase, add real-world API integrations, and deploy your MVP to the internet with Vercel.",
            lessons: [
                "What a database is and why your MVP needs one",
                "Supabase setup: projects, tables, and rows",
                "Designing your data: what information does your app store?",
                "Connecting Supabase to your frontend via vibecoding",
                "Authentication: user sign-up and login with Supabase Auth",
                "What APIs are and how they connect your app to the world",
                "Adding AI-powered features with Anthropic or DeepSeek API",
                "Deployment: from localhost to a live URL on Vercel",
                "Environment variables: keeping API keys safe",
                "Post-deployment: testing on mobile, checking load times, fixing issues"
            ]
        },
        {
            title: "Week 8: Advanced Techniques, Polish & Graduation",
            description: "Use AI as your design partner, polish your MVP, build your portfolio case study, and present your capstone project on Demo Day.",
            lessons: [
                "Designing with prompts: AI as your design partner",
                "AI-assisted design critique and generating variations",
                "Creating marketing assets: landing pages, social graphics, pitch visuals",
                "Bug fixing and refinement sprint with AI debugging",
                "Writing your case study: problem, process, solution, results",
                "Structuring a portfolio presentation",
                "Creating a project README for GitHub",
                "Recording a demo walkthrough of your MVP",
                "Demo Day: live capstone presentations",
                "What's next: freelancing, building, and the alumni community"
            ]
        }
    ]

    const bootcamp = await prisma.bootcamp.update({
        where: { slug: "Product-Design-Engineering" },
        data: {
            title: "Product(UI UX) Design & Engineering Bootcamp",
            curriculum: JSON.stringify(curriculum),
        }
    })

    console.log(`✅ Curriculum updated for "${bootcamp.title}"`)
    console.log(`   Modules: ${curriculum.length} (including prerequisite)`)
    console.log(`   Total lessons: ${curriculum.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)}`)
}

main()
    .catch((e) => {
        console.error("Error:", e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
