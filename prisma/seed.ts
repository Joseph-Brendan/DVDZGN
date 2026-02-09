import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const curriculum = [
        {
            title: "Module 1: Foundations",
            lessons: ["HTML Semantic Structure", "CSS Architecture", "Git & GitHub Workflow"]
        },
        {
            title: "Module 2: JavaScript Mastery",
            lessons: ["ES6+ Features", "Async Programming", "DOM Manipulation"]
        },
        {
            title: "Module 3: React & Next.js",
            lessons: ["Component Design", "Hooks & State", "Server Components"]
        },
        {
            title: "Module 4: Backend & Database",
            lessons: ["API Routes", "Prisma ORM", "Auth & Security"]
        }
    ]

    const bootcamp = await prisma.bootcamp.upsert({
        where: { slug: 'product-engineering-bootcamp' },
        update: {
            startDate: new Date('2026-02-15T18:00:00Z'),
        },
        create: {
            title: 'Product Engineering Bootcamp',
            slug: 'product-engineering-bootcamp',
            description: 'Master full-stack development, design systems, and product thinking. Build real-world applications from scratch.',
            priceNGN: 70000,
            priceUSD: 70,
            curriculum: JSON.stringify(curriculum),
            isActive: true,
            startDate: new Date('2026-02-15T18:00:00Z'), // Sets start date to Feb 15, 2026 (Future relative to Feb 9)
        },
    })

    const graphicDesignBootcamp = await prisma.bootcamp.upsert({
        where: { slug: 'graphic-design-bootcamp' },
        update: {
            isActive: false,
        },
        create: {
            title: 'Graphic Design Bootcamp',
            slug: 'graphic-design-bootcamp',
            description: 'Learn to design beautiful user interfaces and user experiences. Master Figma, typography, and color theory.',
            priceNGN: 60000,
            priceUSD: 60,
            curriculum: JSON.stringify(curriculum), // Reusing curriculum for now
            isActive: false,
        },
    })

    const dataScienceBootcamp = await prisma.bootcamp.upsert({
        where: { slug: 'data-science-ml-bootcamp' },
        update: {
            isActive: false,
            title: 'Data Science/ML Bootcamp',
        },
        create: {
            title: 'Data Science/ML Bootcamp',
            slug: 'data-science-ml-bootcamp',
            description: 'Become a data scientist. Learn Python, SQL, Machine Learning, and how to tell stories with data.',
            priceNGN: 80000,
            priceUSD: 80,
            curriculum: JSON.stringify(curriculum), // Reusing curriculum for now
            isActive: false,
        },
    })

    console.log({ bootcamp })
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
