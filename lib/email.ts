import nodemailer from "nodemailer"

// Only create transporter if SMTP is configured
const isSmtpConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
)

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  : null

export async function sendEnrollmentEmail(email: string, bootcampName: string) {
  if (!transporter) {
    console.warn("SMTP not configured. Skipping enrollment email to:", email)
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: email,
      subject: "Congratulations!",
      text: `
Welcome to our ${bootcampName} Bootcamp

Here are your next steps.
- Join the discord server using this link: https://discord.gg/devdesignhq
- Reach out to your programs manager here if you are unable to Join the discord server: https://wa.me/

See You In Class
`,
    })

    console.log("Message sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending enrollment email:", error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  console.log("Attempting to send welcome email to:", email)
  if (!transporter) {
    console.warn("SMTP not configured. Skipping welcome email to:", email)
    console.log("ENV CHECK - SMTP_HOST:", !!process.env.SMTP_HOST)
    console.log("ENV CHECK - SMTP_USER:", !!process.env.SMTP_USER)
    console.log("ENV CHECK - SMTP_PASS:", !!process.env.SMTP_PASS)
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: email,
      subject: "Welcome to the Dev and Design Community! 🚀",
      text: `
Hi ${name},

Welcome to Dev and Design! We're thrilled to have you join our community of builders and creators.

To get started, feel free to explore our available bootcamps and courses. Whether you're here to master a new skill or refine your craft, we're here to support your journey.

If you have any questions, just reply to this email.

Happy building,
The Dev and Design Team
`,
    })

    console.log("Message sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!transporter) {
    console.warn("SMTP not configured. Skipping reset email to:", email)
    return false
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetLink = `${baseUrl}/auth/reset-password/confirm?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: email,
      subject: "Reset Your Password",
      text: `
You requested a password reset.

Click the link below to set a new password. This link expires in 1 hour.

${resetLink}

If you didn't request this, you can safely ignore this email.

- The Dev and Design Team
`,
    })

    console.log("Reset email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending reset email:", error)
    return false
  }
}
