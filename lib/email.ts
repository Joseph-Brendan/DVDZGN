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
      subject: `You're registered — ${bootcampName}`,
      text: `
Hi there,

You have successfully registered for ${bootcampName}.

Join our community Discord here: {{DISCORD_INVITE_LINK}}

NOTE: Live classes happen on Google Meet. Links will be shared in the community and via email before sessions start.

See you there!
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
  if (!transporter) {
    console.warn("SMTP not configured. Skipping welcome email to:", email)
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: email,
      subject: "Welcome to Dev and Design!",
      text: `
Hi ${name},

Welcome to Dev and Design! We're excited to have you on board.

Start exploring our bootcamps and courses today.

Best,
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
