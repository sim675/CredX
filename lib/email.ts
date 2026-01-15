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
