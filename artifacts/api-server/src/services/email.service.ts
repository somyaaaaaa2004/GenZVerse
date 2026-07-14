import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export type SendEmailResult = {
  sent: boolean;
  previewUrl?: string;
  mode: "smtp" | "ethereal" | "logged";
};

let etherealTransport: Awaited<ReturnType<typeof createEtherealTransport>> | null = null;

async function createEtherealTransport() {
  const nodemailer = await import("nodemailer");
  const testAccount = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return { transport, nodemailer };
}

async function getTransport() {
  if (env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
    return { transport, nodemailer, mode: "smtp" as const };
  }

  if (!etherealTransport) {
    etherealTransport = await createEtherealTransport();
  }
  return { ...etherealTransport, mode: "ethereal" as const };
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  try {
    const { transport, nodemailer, mode } = await getTransport();
    const info = await transport.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    const previewUrl =
      mode === "ethereal" ? nodemailer.getTestMessageUrl(info) || undefined : undefined;

    logger.info(
      { to: options.to, subject: options.subject, mode, previewUrl, messageId: info.messageId },
      "Email sent",
    );

    return { sent: true, previewUrl, mode };
  } catch (err) {
    logger.error({ err, to: options.to, subject: options.subject }, "Email send failed — logging content");
    logger.info({ to: options.to, subject: options.subject, html: options.html }, "Email content");
    return { sent: false, mode: "logged" };
  }
}

export function buildVerificationEmail(token: string, email: string) {
  const url = `${env.APP_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  return {
    subject: "Verify your GenZVerse email",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:16px">
      <h1 style="color:#D9FF00">Welcome to GenZVerse</h1>
      <p>Confirm your email to activate your account.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#D9FF00;color:#000;border-radius:10px;text-decoration:none;font-weight:700">Verify Email</a></p>
      <p style="color:#888;font-size:12px">Or open: ${url}</p>
    </div>`,
    text: `Verify your email: ${url}`,
  };
}

export function buildPasswordResetEmail(token: string) {
  const url = `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    subject: "Reset your GenZVerse password",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:16px">
      <h1 style="color:#D9FF00">Reset Password</h1>
      <p>This link expires in 1 hour.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#D9FF00;color:#000;border-radius:10px;text-decoration:none;font-weight:700">Reset Password</a></p>
      <p style="color:#888;font-size:12px">Or open: ${url}</p>
    </div>`,
    text: `Reset your password: ${url}`,
  };
}

export function buildInvitationEmail(opts: {
  inviterName: string;
  link: string;
}) {
  return {
    subject: `${opts.inviterName} invited you to GenZVerse`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:16px">
      <h1 style="color:#D9FF00">You're invited</h1>
      <p><strong>${opts.inviterName}</strong> wants you to join GenZVerse — challenges, communities, squads, and StyleVerse.</p>
      <p><a href="${opts.link}" style="display:inline-block;padding:12px 20px;background:#D9FF00;color:#000;border-radius:10px;text-decoration:none;font-weight:700">Accept Invite</a></p>
      <p style="color:#888;font-size:12px">Or open: ${opts.link}</p>
    </div>`,
    text: `${opts.inviterName} invited you to GenZVerse: ${opts.link}`,
  };
}
