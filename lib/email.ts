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
      subject: "Enrollment Successful! 🚀",
      text: `
Hello,

You have successfully enrolled in the ${bootcampName}!

Here are your next steps:
- Join our Discord server here: https://discord.gg/ycQ2syKc7Y
- If you are unable to join, please reach out to the Programs Manager at: vyche2010@gmail.com

We are excited to have you on board!

Best,
The Dev and Design Team
`,
      html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Enrollment Successful! 🚀</h2>
        <p>Hello,</p>
        <p>You have successfully enrolled in the <strong>${bootcampName}</strong>!</p>
        <p>Here are your next steps:</p>
        <ul>
            <li>Join our <strong>Discord server</strong> here: <a href="https://discord.gg/ycQ2syKc7Y">https://discord.gg/ycQ2syKc7Y</a></li>
            <li>If you are unable to join, please reach out to the Programs Manager at: <a href="mailto:vyche2010@gmail.com">vyche2010@gmail.com</a></li>
        </ul>
        <p>We are excited to have you on board!</p>
        <p>Best,<br>The Dev and Design Team</p>
      </div>
      `
    })

    console.log("Enrollment email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending enrollment email:", error)
    return false
  }
}

export async function sendAdminEnrollmentNotification(studentEmail: string, bootcampName: string) {
  if (!transporter) {
    console.warn("SMTP not configured. Skipping admin notification.")
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: "jbrendan86@gmail.com",
      subject: "New Enrollment",
      text: `
New Enrollment Alert!

Student Email: ${studentEmail}
Bootcamp: ${bootcampName}

Time: ${new Date().toLocaleString()}
`,
    })

    console.log("Admin notification sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending admin notification:", error)
    return false
  }
}


export async function sendWelcomeEmail(email: string, name: string) {
  console.log("Attempting to send welcome email to:", email)
  if (!transporter) {
    console.warn("SMTP not configured. Skipping welcome email to:", email)
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

  // Use explicit app URL, or fall back to production domain / localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.NODE_ENV === "production" ? "https://www.devdesignhq.com" : "http://localhost:3000")

  const resetLink = `${baseUrl}/auth/reset-password/confirm?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: email,
      subject: "Reset Your Password",
      text: `You requested a password reset.\n\nClick the link below to set a new password. This link expires in 1 hour.\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.\n\n- The Dev and Design Team`,
      html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
        </p>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 12px; word-break: break-all; color: #666;">${resetLink}</p>
        <p style="font-size: 12px; color: #999; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        <p>- The Dev and Design Team</p>
      </div>
      `
    })

    console.log("Reset email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending reset email:", error)
    return false
  }
}

export async function sendWaitlistConfirmationEmail(email: string, name: string, bootcampName: string) {
  if (!transporter) {
    console.warn("SMTP not configured. Skipping waitlist confirmation email to:", email)
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: email,
      subject: `You're on the Waitlist for ${bootcampName}! 🎉`,
      text: `
Hi ${name},

You have been added to the waitlist for ${bootcampName}!

We'll notify you as soon as enrollment opens. Stay tuned!

Best,
The Dev and Design Team
`,
      html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>You're on the Waitlist! 🎉</h2>
        <p>Hi ${name},</p>
        <p>You have been added to the waitlist for <strong>${bootcampName}</strong>!</p>
        <p>We'll notify you as soon as enrollment opens. Stay tuned!</p>
        <p>Best,<br>The Dev and Design Team</p>
      </div>
      `
    })

    console.log("Waitlist confirmation email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending waitlist confirmation email:", error)
    return false
  }
}

export async function sendAdminWaitlistNotification(userName: string, userEmail: string, bootcampName: string) {
  if (!transporter) {
    console.warn("SMTP not configured. Skipping admin waitlist notification.")
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dev and Design" <learn@devdesignhq.com>',
      to: "jbrendan86@gmail.com",
      subject: "Waitlist Joined",
      text: `
A user has joined the waitlist!

Name: ${userName}
Email: ${userEmail}
Bootcamp: ${bootcampName}

Time: ${new Date().toLocaleString()}
`,
      html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Waitlist Joined</h2>
        <p>A user has joined the waitlist:</p>
        <ul>
          <li><strong>Name:</strong> ${userName}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Bootcamp:</strong> ${bootcampName}</li>
        </ul>
        <p style="font-size: 12px; color: #666;">Time: ${new Date().toLocaleString()}</p>
      </div>
      `
    })

    console.log("Admin waitlist notification sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending admin waitlist notification:", error)
    return false
  }
}
