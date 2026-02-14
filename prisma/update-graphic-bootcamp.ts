import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating "Graphic Design Bootcamp" -> "Design to MVP Bootcamp"...')

    const curriculum = [
        {
            title: "Program Overview",
            description: "A 6-week immersive vibe coding bootcamp for UI/UX designers. Learn to build MVPs using AI and Agents."
        },
        {
            title: "Schedule",
            description: "Daily classes from 2pm to 4pm. Starting 30th March 2026."
        },
        {
            title: "Week 1-6",
            description: "From Design to MVP: Agentic Systems, Vibe Coding, and Building Real Apps."
        }
    ]

    try {
        const bootcamp = await prisma.bootcamp.update({
            where: { slug: 'graphic-design-bootcamp' },
            data: {
                title: 'Design to MVP Bootcamp',
                slug: 'design-to-mvp-bootcamp',
                description: 'A vibe coding bootcamp for UI/UX designers to learn how to build MVPs using AI and AI agents. Prerequisites: Must be a designer who knows how to design already.',
                priceNGN: 50000,
                priceUSD: 50,
                isActive: true,
                startDate: new Date('2026-03-30T14:00:00Z'),
                curriculum: JSON.stringify(curriculum)
            }
        })
        console.log('Update successful:', bootcamp)
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.log('Graphic Design Bootcamp not found. Checking if Design to MVP already exists...')
            const existing = await prisma.bootcamp.findUnique({ where: { slug: 'design-to-mvp-bootcamp' } })
            if (existing) {
                console.log('Design to MVP Bootcamp already exists:', existing)
                // Ensure it's active
                if (!existing.isActive) {
                    await prisma.bootcamp.update({
                        where: { slug: 'design-to-mvp-bootcamp' },
                        data: { isActive: true }
                    })
                    console.log('Activated existing Design to MVP Bootcamp.')
                }
            } else {
                console.log('Neither bootcamp found. Creating Design to MVP Bootcamp...')
                const newBootcamp = await prisma.bootcamp.create({
                    data: {
                        title: 'Design to MVP Bootcamp',
                        slug: 'design-to-mvp-bootcamp',
                        description: 'A vibe coding bootcamp for UI/UX designers to learn how to build MVPs using AI and AI agents. Prerequisites: Must be a designer who knows how to design already.',
                        priceNGN: 50000,
                        priceUSD: 50,
                        isActive: true,
                        startDate: new Date('2026-03-30T14:00:00Z'),
                        curriculum: JSON.stringify(curriculum)
                    }
                })
                console.log('Created new bootcamp:', newBootcamp)
            }
        } else {
            throw error
        }
    }
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
