// src/services/emailService.ts
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Staff Arts" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #20a87c;">Staff Arts</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}"
          style="display: inline-block; margin: 16px 0; padding: 12px 24px;
                 background: #20a87c; color: white; border-radius: 6px;
                 text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};