import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const bootcamp = await prisma.bootcamp.update({
        where: { slug: "product-engineering-bootcamp" },
        data: {
            title: "Product(UI UX) Design & Engineering Bootcamp",
            slug: "Product-Design-Engineering",
        }
    })

    console.log(`✅ Bootcamp renamed:`)
    console.log(`   Title: ${bootcamp.title}`)
    console.log(`   Slug: ${bootcamp.slug}`)
    console.log(`   URL: /bootcamps/${bootcamp.slug}`)
}

main()
    .catch((e) => {
        console.error("Error:", e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
