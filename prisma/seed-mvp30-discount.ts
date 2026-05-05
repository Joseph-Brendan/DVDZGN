import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DESIGN_TO_MVP_BOOTCAMP_SLUG = 'design-to-mvp-bootcamp'

async function main() {
    // Resolve the bootcamp ID from the slug
    const bootcamp = await prisma.bootcamp.findUnique({
        where: { slug: DESIGN_TO_MVP_BOOTCAMP_SLUG },
        select: { id: true, title: true }
    })

    if (!bootcamp) {
        throw new Error(`Bootcamp with slug "${DESIGN_TO_MVP_BOOTCAMP_SLUG}" not found. Make sure it exists in the database.`)
    }

    console.log(`✅ Found bootcamp: ${bootcamp.title} (${bootcamp.id})`)

    const discountCode = await prisma.discountCode.upsert({
        where: { code: 'MVP30' },
        update: {
            discountPercent: 30,
            isActive: true,
            description: 'Design To MVP Bootcamp — 30% discount (enrolled students only)',
            restrictedToBootcampId: bootcamp.id,
        },
        create: {
            code: 'MVP30',
            discountPercent: 30,
            description: 'Design To MVP Bootcamp — 30% discount (enrolled students only)',
            isActive: true,
            maxUses: null, // Unlimited uses
            restrictedToBootcampId: bootcamp.id,
        },
    })

    console.log('✅ MVP30 discount code created/updated:')
    console.log(`   Code:           ${discountCode.code}`)
    console.log(`   Discount:       ${discountCode.discountPercent}%`)
    console.log(`   Active:         ${discountCode.isActive}`)
    console.log(`   Restricted to:  ${bootcamp.title}`)
    console.log(`   Bootcamp ID:    ${discountCode.restrictedToBootcampId}`)
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
