import nodemailer from "nodemailer";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

declare global {
  var __pattayabevMailer: ReturnType<typeof nodemailer.createTransport> | undefined;
}

const transporter =
  global.__pattayabevMailer ??
  nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: Number(getRequiredEnv("SMTP_PORT")),
    secure: Number(getRequiredEnv("SMTP_PORT")) === 465,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS")
    }
  });

if (process.env.NODE_ENV !== "production") {
  global.__pattayabevMailer = transporter;
}

export async function sendVerificationEmailMessage({
  to,
  verifyUrl,
  userName
}: {
  to: string;
  verifyUrl: string;
  userName?: string | null;
}) {
  const fromName = getRequiredEnv("EMAIL_FROM_NAME");
  const fromAddress = getRequiredEnv("EMAIL_FROM_ADDRESS");

  console.log("[email] sendVerificationEmailMessage:start", {
    to,
    fromAddress,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject: "Confirm your email",
      text: [
        `Hello${userName ? ` ${userName}` : ""},`,
        "",
        "Please verify your email to activate your account.",
        "This link will expire in 1 hour.",
        "",
        verifyUrl
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8f5ef; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #eadfce;">
            <p style="margin: 0 0 10px; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #8b6a2b;">Sophon Delivery</p>
            <h1 style="margin: 0 0 16px; font-size: 28px; color: #171212;">Confirm your email</h1>
            <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.7; color: #4a433d;">
              Please verify your email to activate your account.
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: #6f675f;">
              This verification link expires in 1 hour.
            </p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 24px; border-radius: 999px; background: #171212; color: #ffffff; text-decoration: none; font-weight: 700;">
              Verify email
            </a>
            <p style="margin: 24px 0 8px; font-size: 13px; color: #6f675f;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin: 0; word-break: break-all; font-size: 13px; color: #2437e8;">${verifyUrl}</p>
          </div>
        </div>
      `
    });

    console.log("[email] sendVerificationEmailMessage:success", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
  } catch (error) {
    console.error("[email] sendVerificationEmailMessage:error", error);
    throw error;
  }
}
