import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEnrollmentEmail, sendAdminEnrollmentNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
        const signature = req.headers.get("verif-hash");

        if (!secretHash || signature !== secretHash) {
            // return 401 but don't leak reason
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();

        // We only care about successful charges
        if (payload.event !== "charge.completed" || payload.data.status !== "successful") {
            return NextResponse.json({ status: "ignored" });
        }

        const { id: transactionId, amount, currency, customer, meta, tx_ref } = payload.data;

        // Verify currency
        if (currency !== "NGN") {
            // log invalid currency
            return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
        }

        // Check idempotency - if transaction already used
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: { transactionId: String(transactionId) }
        });

        if (existingEnrollment) {
            return NextResponse.json({ status: "already_processed" });
        }

        // Find User
        // We rely on the email from the customer object as the source of truth for the user
        // If user doesn't exist, we can't enroll them. 
        // Ideally they should have an account before paying, or we create one?
        // App logic seems to expect user to be logged in to pay, or at least exist.
        // Let's find by email.
        const user = await prisma.user.findUnique({
            where: { email: customer.email }
        });

        if (!user) {
            console.error(`Webhook: User not found for email ${customer.email}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get bootcampId from meta (preferred) or we'd have to parse tx_ref if we implemented that.
        // We just added meta to the client.
        const bootcampId = meta?.bootcampId;

        if (!bootcampId) {
            console.error("Webhook: No bootcampId in metadata");
            return NextResponse.json({ error: "No bootcampId provided" }, { status: 400 });
        }

        // Verify Amount
        const bootcamp = await prisma.bootcamp.findUnique({
            where: { id: bootcampId }
        });

        if (!bootcamp) {
            return NextResponse.json({ error: "Bootcamp not found" }, { status: 404 });
        }

        if (amount < bootcamp.priceNGN) {
            console.error(`Webhook: Amount mismatch. Paid ${amount}, Expected ${bootcamp.priceNGN}`);
            return NextResponse.json({ error: "Insufficient amount" }, { status: 400 });
        }

        // Create Enrollment
        // Double check not already enrolled (optional but good safety)
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
        // Send Email
        await sendEnrollmentEmail(user.email!, bootcamp.title);
        await sendAdminEnrollmentNotification(user.email!, bootcamp.title);

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Flutterwave Webhook Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
