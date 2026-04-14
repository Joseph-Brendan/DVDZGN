import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEnrollmentEmail, sendAdminEnrollmentNotification } from "@/lib/email"

const VALID_CURRENCIES = ["NGN", "USD"]

export async function POST(req: Request) {
    try {
        const { transaction_id, bootcampId, discountCode } = await req.json()

        if (!transaction_id || !bootcampId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // I5: Validate transaction_id is numeric to prevent path injection
        if (isNaN(Number(transaction_id))) {
            return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 })
        }

        // Require authentication
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            // C6: Log failed attempt
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transaction_id),
                    bootcampId,
                    source: "verify",
                    status: "failed",
                    errorMessage: "No authenticated session — session may have expired during payment",
                }
            }).catch(e => console.error("PaymentLog write failed:", e))

            return NextResponse.json({ error: "Authentication required. Please log in and try again." }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transaction_id),
                    userEmail: session.user.email,
                    bootcampId,
                    source: "verify",
                    status: "failed",
                    errorMessage: "User not found in database",
                }
            }).catch(e => console.error("PaymentLog write failed:", e))

            return NextResponse.json({ error: "User not found. Please log in and try again." }, { status: 401 })
        }

        const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY

        if (!flwSecretKey) {
            console.error("FLUTTERWAVE_SECRET_KEY is not set")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // 1. Verify transaction with Flutterwave
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${Number(transaction_id)}/verify`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${flwSecretKey}`
            }
        })

        const data = await response.json()

        if (data.status !== "success") {
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transaction_id),
                    userId: user.id,
                    userEmail: user.email,
                    bootcampId,
                    source: "verify",
                    status: "failed",
                    errorMessage: `Flutterwave verification failed: ${data.message || data.status}`,
                    rawResponse: JSON.stringify(data).slice(0, 2000),
                }
            }).catch(e => console.error("PaymentLog write failed:", e))

            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
        }

        const { status, currency, amount } = data.data

        // 2. Validate transaction details
        if (status === "pending") {
            return NextResponse.json({ success: false, pending: true, message: "Payment is still being processed" }, { status: 202 })
        }

        if (status !== "successful" || !VALID_CURRENCIES.includes(currency)) {
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transaction_id),
                    userId: user.id,
                    userEmail: user.email,
                    bootcampId,
                    source: "verify",
                    status: "failed",
                    errorMessage: `Invalid status (${status}) or currency (${currency})`,
                    amount,
                    currency,
                }
            }).catch(e => console.error("PaymentLog write failed:", e))

            return NextResponse.json({ error: "Invalid transaction status or currency" }, { status: 400 })
        }

        // 3. Fetch Bootcamp and Verify Amount
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        })

        if (!bootcamp) {
            return NextResponse.json({ error: "Bootcamp not found" }, { status: 404 })
        }

        let expectedPrice = currency === "NGN" ? bootcamp.priceNGN : bootcamp.priceUSD

        // 4. Validate discount code (but do NOT increment usage yet)
        let validatedDiscountCodeId: string | null = null
        if (discountCode) {
            const discount = await prisma.discountCode.findUnique({
                where: { code: String(discountCode).toUpperCase().trim() }
            })

            if (discount && discount.isActive) {
                const now = new Date()
                const isValidDate = (!discount.validFrom || now >= discount.validFrom) &&
                    (!discount.validUntil || now <= discount.validUntil)
                const isWithinUsageLimit = discount.maxUses === null || discount.currentUses < discount.maxUses

                if (isValidDate && isWithinUsageLimit) {
                    expectedPrice = Math.round(expectedPrice * (1 - discount.discountPercent / 100))
                    validatedDiscountCodeId = discount.id
                }
            }
        }

        if (amount < expectedPrice) {
            console.error(`Amount mismatch: paid ${amount} ${currency}, expected ${expectedPrice} ${currency}`)
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transaction_id),
                    userId: user.id,
                    userEmail: user.email,
                    bootcampId,
                    source: "verify",
                    status: "failed",
                    errorMessage: `Amount mismatch: paid ${amount} ${currency}, expected ${expectedPrice} ${currency}`,
                    amount,
                    currency,
                }
            }).catch(e => console.error("PaymentLog write failed:", e))

            return NextResponse.json({ error: "Payment amount does not match bootcamp price" }, { status: 400 })
        }

        // 5. Check for existing enrollment (idempotency)
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                OR: [
                    { userId: user.id, bootcampId: bootcampId },
                    { transactionId: String(transaction_id) }
                ]
            }
        })

        if (existingEnrollment) {
            return NextResponse.json({ success: true, message: "Already enrolled or transaction already used" })
        }

        // Create enrollment AND increment discount usage in a single transaction
        await prisma.$transaction(async (tx) => {
            await tx.enrollment.create({
                data: {
                    userId: user.id,
                    bootcampId: bootcampId,
                    transactionId: String(transaction_id),
                    status: "enrolled",
                    ...(validatedDiscountCodeId ? { discountCodeId: validatedDiscountCodeId } : {})
                }
            })

            if (validatedDiscountCodeId) {
                await tx.discountCode.update({
                    where: { id: validatedDiscountCodeId },
                    data: { currentUses: { increment: 1 } }
                })
            }
        })

        // C6: Log successful enrollment
        await prisma.paymentLog.create({
            data: {
                transactionId: String(transaction_id),
                userId: user.id,
                userEmail: user.email,
                bootcampId,
                source: "verify",
                status: "success",
                amount,
                currency,
            }
        }).catch(e => console.error("PaymentLog write failed:", e))

        // C1: Send emails fire-and-forget (don't block the response)
        sendEnrollmentEmail(user.email!, bootcamp.title, user.name || undefined).catch((err) =>
            console.error("Failed to send enrollment email:", err)
        )
        sendAdminEnrollmentNotification(user.email!, bootcamp.title, user.name || undefined).catch((err) =>
            console.error("Failed to send admin notification:", err)
        )

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Flutterwave verification error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
