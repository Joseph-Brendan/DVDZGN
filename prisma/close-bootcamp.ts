import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const bootcamp = await prisma.bootcamp.update({
        where: { slug: "design-to-mvp-bootcamp" },
        data: { isActive: false }
    })

    console.log(`✅ Bootcamp "${bootcamp.title}" has been set to inactive (isActive: ${bootcamp.isActive})`)
}

main()
    .catch((e) => {
        console.error("Error:", e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
