import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Renaming "Design to MVP Bootcamp" -> "Design to MVP"')

    const bootcamp = await prisma.bootcamp.update({
        where: { slug: 'design-to-mvp-bootcamp' },
        data: {
            title: 'Design to MVP', // Removed 'Bootcamp' from title
            // slug remains 'design-to-mvp-bootcamp' to avoid breaking URLs/SEO unless user asks
        }
    })
    console.log('Updated:', bootcamp)
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
