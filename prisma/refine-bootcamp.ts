import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Refining Design to MVP Bootcamp Content...')

    // User wants prerequisite highlighted as standalone.
    // I will move it to the curriculum array as a specific section or format the description differently.
    // Since the UI likely displays 'description' as a block, and 'curriculum' as an accordion or list, 
    // I'll put the Prerequisite in the curriculum JSON as the *first* item to make it stand out, 
    // or use the description but format it with a Markdown header if supported, or just a clear separation.
    // However, looking at the previous description: "A vibe coding bootcamp... Prerequisites: Must be..."
    // I will remove it from description and add it as a standalone item in curriculum or just a clean sentence.
    // Actually, I'll make the description pure and put "Prerequisites" as the first "Module" in curriculum so it appears on the card/page details.

    const curriculum = [
        {
            title: "Prerequisites",
            description: "You must be a designer who already knows how to design. This bootcamp focuses on turning those designs into code."
        },
        {
            title: "Program Overview",
            description: "A 6-week immersive vibe coding bootcamp for UI/UX designers. Learn to build MVPs using AI and Agents."
        },
        {
            title: "Schedule",
            description: "Daily classes from 2pm to 4pm. Starting 30th March 2026."
        },
        {
            title: "Curriculum Breakdown",
            description: "Week 1-6: From Design to MVP, Agentic Systems, and Vibe Coding."
        }
    ]

    const bootcamp = await prisma.bootcamp.update({
        where: { slug: 'design-to-mvp-bootcamp' },
        data: {
            description: 'A vibe coding bootcamp for UI/UX designers to learn how to build MVPs using AI and AI agents.', // Removed prerequisite text from here
            curriculum: JSON.stringify(curriculum),
            startDate: new Date('2026-03-30T14:00:00Z'), // Confirmed 30th March
        }
    })

    console.log('Bootcamp updated:', bootcamp)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
