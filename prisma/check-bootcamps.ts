import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const bootcamps = await prisma.bootcamp.findMany()
    console.log('Existing Bootcamps:')
    bootcamps.forEach(b => {
        console.log(`- Title: ${b.title}, Slug: ${b.slug}, Active: ${b.isActive}, ID: ${b.id}`)
    })
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
