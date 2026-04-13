import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const bootcamp = await prisma.bootcamp.update({
        where: { slug: "product-engineering-bootcamp" },
        data: {
            title: "Product(UI/UX) Engineering Bootcamp",
            description: "Learn how to Design and Build mobile and Web applications using AI. Master product thinking, UI/UX design, and full-stack development.",
            isActive: true,
            priceNGN: 50000,
            priceUSD: 50,
            startDate: new Date("2026-05-22T09:00:00Z"),
            duration: "8 Weeks",
        }
    })

    // Also set duration for the Design to MVP bootcamp (was created before the field existed)
    await prisma.bootcamp.update({
        where: { slug: "design-to-mvp-bootcamp" },
        data: { duration: "6 Weeks" }
    })

    console.log(`✅ Bootcamp updated:`)
    console.log(`   Title: ${bootcamp.title}`)
    console.log(`   Active: ${bootcamp.isActive}`)
    console.log(`   Price: ₦${bootcamp.priceNGN.toLocaleString()} / $${bootcamp.priceUSD}`)
    console.log(`   Start: ${bootcamp.startDate.toDateString()}`)
    console.log(`   Duration: ${bootcamp.duration}`)
}

main()
    .catch((e) => {
        console.error("Error:", e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
