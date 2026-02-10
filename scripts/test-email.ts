import fs from "fs"
import path from "path"

// Load env vars manually
try {
    const envPath = path.resolve(process.cwd(), ".env")
    const envFile = fs.readFileSync(envPath, "utf8")
    envFile.split("\n").forEach(line => {
        const parts = line.split("=")
        if (parts.length >= 2) {
            const key = parts[0].trim()
            let value = parts.slice(1).join("=").trim()
            // Strip quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            if (key && value) {
                process.env[key] = value
            }
        }
    })
} catch (e) {
    console.error("Error loading .env file:", e)
}

async function testEmail() {
    // Dynamic import to ensure env vars are loaded first
    const { sendWelcomeEmail } = await import("../lib/email")

    console.log("Testing email sending...")
    console.log("SMTP_HOST:", process.env.SMTP_HOST)
    console.log("SMTP_USER:", process.env.SMTP_USER)

    // Replace with a valid email to test
    const testEmail = process.env.SMTP_USER || "test@example.com"

    console.log(`Sending test email to ${testEmail}...`)

    const result = await sendWelcomeEmail(testEmail, "Test User")

    if (result) {
        console.log("✅ Email sent successfully!")
    } else {
        console.error("❌ Failed to send email.")
    }
}

testEmail()
