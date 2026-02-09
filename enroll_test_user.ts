import { prisma } from './lib/prisma'

async function requestEnrollment() {
    // 1. Get the user (using the email I just signed up with in the browser session)
    // The browser subagent used "testuser4@example.com"
    const user = await prisma.user.findUnique({
        where: { email: 'testuser4@example.com' }
    })

    if (!user) {
        console.error("User not found")
        process.exit(1)
    }

    // 2. Get the Product Engineering Bootcamp
    const bootcamp = await prisma.bootcamp.findUnique({
        where: { slug: 'product-engineering-bootcamp' }
    })

    if (!bootcamp) {
        console.error("Bootcamp not found")
        process.exit(1)
    }

    // 3. Create Enrollment
    await prisma.enrollment.create({
        data: {
            userId: user.id,
            bootcampId: bootcamp.id,
        }
    })

    console.log(`Enrolled user ${user.email} in ${bootcamp.title}`)
}

requestEnrollment()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
