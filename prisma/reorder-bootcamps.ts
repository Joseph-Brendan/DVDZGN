import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Reordering Bootcamps & Updating Status...')

    // 1. Set Product Engineering to Inactive
    const prodEng = await prisma.bootcamp.update({
        where: { slug: 'product-engineering-bootcamp' },
        data: {
            isActive: false,
            // The UI code already shows "Dates to be announced" for inactive bootcamps, so setting isActive: false is sufficient.
            // See: app/bootcamps/page.tsx line 44: <span>Dates to be announced</span> inside the (!bootcamp.isActive) block
        }
    })
    console.log('Product Engineering set to Inactive:', prodEng.title)

    // 2. Make Design to MVP the first card
    // The page sorts by `createdAt: "desc"` (newest first).
    // So we set Design to MVP `createdAt` to now (or a future date to be safe).
    // Bootcamps usage:
    // const bootcamps = await prisma.bootcamp.findMany({ orderBy: { createdAt: "desc" } })

    const designMVP = await prisma.bootcamp.update({
        where: { slug: 'design-to-mvp-bootcamp' },
        data: {
            createdAt: new Date() // Set to now to ensure it's the "newest"
        }
    })
    console.log('Design to MVP moved to top (updated createdAt):', designMVP.title)
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
