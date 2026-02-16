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

        // Check idempotency
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: { transactionId: String(transactionId) }
        });

        if (existingEnrollment) {
            return NextResponse.json({ status: "already_processed" });
        }

        // Find User
        const user = await prisma.user.findUnique({
            where: { email: customer.email }
        });

        if (!user) {
            console.error(`Webhook: User not found for email ${customer.email}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const bootcampId = meta?.bootcampId;

        if (!bootcampId) {
            console.error("Webhook: No bootcampId in metadata");
            return NextResponse.json({ error: "No bootcampId provided" }, { status: 400 });
        }

        // Verify Amount against the correct price based on currency
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        });

        if (!bootcamp) {
            return NextResponse.json({ error: "Bootcamp not found" }, { status: 404 });
        }

        const expectedPrice = currency === "NGN" ? bootcamp.priceNGN : bootcamp.priceUSD;

        if (amount < expectedPrice) {
            console.error(`Webhook: Amount mismatch. Paid ${amount} ${currency}, Expected ${expectedPrice} ${currency}`);
            return NextResponse.json({ error: "Insufficient amount" }, { status: 400 });
        }

        // Check not already enrolled
        const checkEnrollment = await prisma.enrollment.findFirst({
            where: { userId: user.id, bootcampId: bootcampId }
        });

        if (checkEnrollment) {
            console.log("Webhook: User already enrolled");
            return NextResponse.json({ status: "already_enrolled" });
        }

        await prisma.enrollment.create({
            data: {
                userId: user.id,
                bootcampId: bootcampId,
                transactionId: String(transactionId),
                status: "enrolled"
            }
        });

        // Send Email
        await sendEnrollmentEmail(user.email!, bootcamp.title);
        await sendAdminEnrollmentNotification(user.email!, bootcamp.title);

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Flutterwave Webhook Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
