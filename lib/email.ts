import nodemailer from "nodemailer";

// Gmail-specific configuration
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;
const gmailFrom = process.env.GMAIL_FROM || "no-reply@example.com";

let transporter: nodemailer.Transporter | null = null;

if (gmailUser && gmailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!transporter) {
    console.warn("Gmail is not configured, skipping email send");
    return;
  }

  try {
    await transporter.sendMail({
      from: gmailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Error sending email via Gmail", error);
  }
}

// Build the base application URL for links inside transactional emails
function getBaseAppUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_URL;

  if (explicit) {
    const hasProtocol = explicit.startsWith("http://") || explicit.startsWith("https://");
    const normalized = hasProtocol ? explicit : `https://${explicit}`;
    return normalized.replace(/\/+$/, "");
  }

  // Fallback for local development
  return "http://localhost:3000";
}

// Helper to send the email verification link to a newly registered user
export async function sendVerificationEmail(params: {
  to: string;
  token: string;
  name?: string;
}) {
  const baseUrl = getBaseAppUrl();
  const verificationUrl = `${baseUrl}/verify?token=${encodeURIComponent(
    params.token
  )}`;

  const recipientName = params.name || "there";

  const html = `
    <p>Hi ${recipientName},</p>
    <p>Thanks for signing up to CredX. Please confirm your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}">Verify your email</a></p>
    <p>If you did not create this account, you can safely ignore this email.</p>
  `;

  // Reuse the generic email sender so all transport configuration stays in one place
  await sendEmail({
    to: params.to,
    subject: "Verify your email address",
    html,
  });
}
