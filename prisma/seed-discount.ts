import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const discountCode = await prisma.discountCode.upsert({
        where: { code: 'ALUMNI20' },
        update: {
            discountPercent: 20,
            isActive: true,
            description: 'Alumni 20% discount',
        },
        create: {
            code: 'ALUMNI20',
            discountPercent: 20,
            description: 'Alumni 20% discount',
            isActive: true,
            maxUses: null, // Unlimited uses
        },
    })

    console.log('Discount code created:', discountCode)
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
