// src/services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'STAFF Arts <noreply@staffarts.com>';
const BASE_URL = process.env.APP_URL ?? 'https://staffarts.com';

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const link = `${BASE_URL}/api/auth/verify-email/${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your STAFF Arts account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; color: #f5f5f5; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 300; margin-bottom: 8px;">
          Welcome to <span style="color: #2dd4a7; font-style: italic;">STAFF Arts</span>
        </h1>
        <p style="color: #aaa; margin-bottom: 24px;">Hi ${name}, please verify your email to get started.</p>
        <a href="${link}"
           style="display: inline-block; background: #2dd4a7; color: #0f0f0f; font-weight: 600;
                  padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 15px;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  });
};
