import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEnrollmentEmail, sendAdminEnrollmentNotification } from "@/lib/email";

const VALID_CURRENCIES = ["NGN", "USD"];

export async function POST(req: Request) {
    try {
        const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
        const signature = req.headers.get("verif-hash");

        if (!secretHash || signature !== secretHash) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();

        // We only care about successful charges
        if (payload.event !== "charge.completed" || payload.data.status !== "successful") {
            return NextResponse.json({ status: "ignored" });
        }

        const { id: transactionId, amount, currency, customer, meta } = payload.data;

        // Verify currency (accept both NGN and USD)
        if (!VALID_CURRENCIES.includes(currency)) {
            return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
        }

        // Quick idempotency check by transactionId first (cheapest check)
        const existingByTxn = await prisma.enrollment.findFirst({
            where: { transactionId: String(transactionId) }
        });

        if (existingByTxn) {
            return NextResponse.json({ status: "already_processed" });
        }

        // C3: Normalize email — case-insensitive match with trim
        const customerEmail = customer?.email?.toLowerCase().trim();

        if (!customerEmail) {
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transactionId),
                    source: "webhook",
                    status: "failed",
                    errorMessage: "No customer email in webhook payload",
                    amount,
                    currency,
                    rawResponse: JSON.stringify(payload.data).slice(0, 2000),
                }
            }).catch(e => console.error("PaymentLog write failed:", e));

            return NextResponse.json({ error: "No customer email" }, { status: 400 });
        }

        // Find User — C3: search by normalized email
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: customerEmail,
                    mode: "insensitive"
                }
            }
        });

        if (!user) {
            // C6: Log failed attempt
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transactionId),
                    userEmail: customerEmail,
                    source: "webhook",
                    status: "failed",
                    errorMessage: `User not found for email: ${customerEmail}`,
                    amount,
                    currency,
                    rawResponse: JSON.stringify(payload.data).slice(0, 2000),
                }
            }).catch(e => console.error("PaymentLog write failed:", e));

            console.error(`Webhook: User not found for email ${customerEmail}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const bootcampId = meta?.bootcampId;

        if (!bootcampId) {
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transactionId),
                    userId: user.id,
                    userEmail: user.email,
                    source: "webhook",
                    status: "failed",
                    errorMessage: "No bootcampId in webhook metadata",
                    amount,
                    currency,
                    rawResponse: JSON.stringify(payload.data).slice(0, 2000),
                }
            }).catch(e => console.error("PaymentLog write failed:", e));

            console.error("Webhook: No bootcampId in metadata");
            return NextResponse.json({ error: "No bootcampId provided" }, { status: 400 });
        }

        // C4: Verify transaction with Flutterwave API (double-check amount/status)
        const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        if (flwSecretKey) {
            try {
                const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${Number(transactionId)}/verify`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${flwSecretKey}`
                    }
                });
                const verifyData = await verifyRes.json();

                if (verifyData.status !== "success" || verifyData.data?.status !== "successful") {
                    await prisma.paymentLog.create({
                        data: {
                            transactionId: String(transactionId),
                            userId: user.id,
                            userEmail: user.email,
                            bootcampId,
                            source: "webhook",
                            status: "failed",
                            errorMessage: `Flutterwave API verification failed: ${verifyData.data?.status || verifyData.status}`,
                            amount,
                            currency,
                            rawResponse: JSON.stringify(verifyData).slice(0, 2000),
                        }
                    }).catch(e => console.error("PaymentLog write failed:", e));

                    return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
                }
            } catch (verifyError) {
                // If Flutterwave API is down, log but continue with webhook data
                console.error("Webhook: Flutterwave API verify failed, proceeding with webhook data:", verifyError);
            }
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_bootcampId: {
                    userId: user.id,
                    bootcampId: bootcampId
                }
            }
        });

        if (existingEnrollment) {
            return NextResponse.json({ status: "already_enrolled" });
        }

        // Verify Amount against the correct price based on currency
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        });

        if (!bootcamp) {
            return NextResponse.json({ error: "Bootcamp not found" }, { status: 404 });
        }

        let expectedPrice = currency === "NGN" ? bootcamp.priceNGN : bootcamp.priceUSD;

        // Apply discount if a valid discount code was used (from meta)
        const discountCode = meta?.discountCode;
        let validatedDiscountCodeId: string | null = null;
        if (discountCode) {
            const discount = await prisma.discountCode.findUnique({
                where: { code: String(discountCode).toUpperCase().trim() }
            });

            if (discount && discount.isActive) {
                const now = new Date();
                const isValidDate = (!discount.validFrom || now >= discount.validFrom) &&
                    (!discount.validUntil || now <= discount.validUntil);
                const isWithinUsageLimit = discount.maxUses === null || discount.currentUses < discount.maxUses;

                if (isValidDate && isWithinUsageLimit) {
                    expectedPrice = Math.round(expectedPrice * (1 - discount.discountPercent / 100));
                    validatedDiscountCodeId = discount.id;
                }
            }
        }

        if (amount < expectedPrice) {
            await prisma.paymentLog.create({
                data: {
                    transactionId: String(transactionId),
                    userId: user.id,
                    userEmail: user.email,
                    bootcampId,
                    source: "webhook",
                    status: "failed",
                    errorMessage: `Amount mismatch: paid ${amount} ${currency}, expected ${expectedPrice} ${currency}`,
                    amount,
                    currency,
                }
            }).catch(e => console.error("PaymentLog write failed:", e));

            console.error(`Webhook: Amount mismatch. Paid ${amount} ${currency}, Expected ${expectedPrice} ${currency}`);
            return NextResponse.json({ error: "Insufficient amount" }, { status: 400 });
        }

        await prisma.enrollment.create({
            data: {
                userId: user.id,
                bootcampId: bootcampId,
                transactionId: String(transactionId),
                status: "enrolled",
                ...(validatedDiscountCodeId ? { discountCodeId: validatedDiscountCodeId } : {})
            }
        });

        // C6: Log successful enrollment
        await prisma.paymentLog.create({
            data: {
                transactionId: String(transactionId),
                userId: user.id,
                userEmail: user.email,
                bootcampId,
                source: "webhook",
                status: "success",
                amount,
                currency,
            }
        }).catch(e => console.error("PaymentLog write failed:", e));

        // C1: Send emails fire-and-forget
        sendEnrollmentEmail(user.email!, bootcamp.title).catch((err) =>
            console.error("Failed to send enrollment email:", err)
        );
        sendAdminEnrollmentNotification(user.email!, bootcamp.title).catch((err) =>
            console.error("Failed to send admin notification:", err)
        );

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Flutterwave Webhook Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
