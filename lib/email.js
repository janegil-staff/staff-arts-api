import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Staff Arts <noreply@staffarts.com>";

export async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: "Welcome to Staff Arts",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #FAFAFA; padding: 40px;">
        <h1 style="color: #E5C07B; font-family: Georgia, serif;">Welcome, ${name}</h1>
        <p style="color: #A3A3A3; line-height: 1.6;">Thank you for joining Staff Arts — your new home for discovering, creating, and collecting art.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/explore" style="display: inline-block; margin-top: 20px; padding: 12px 32px; background: #E5C07B; color: #0A0A0A; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Exploring</a>
      </div>
    `,
  });
}

export async function sendOrderConfirmation(email, order) {
  return sendEmail({
    to: email,
    subject: `Order Confirmed — ${order.artworkTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #FAFAFA; padding: 40px;">
        <h1 style="color: #E5C07B; font-family: Georgia, serif;">Order Confirmed</h1>
        <p style="color: #A3A3A3;">Your purchase of <strong>${order.artworkTitle}</strong> by ${order.artistName} has been confirmed.</p>
        <p style="color: #A3A3A3;">Order total: <strong style="font-family: monospace; color: #FAFAFA;">$${(order.amount / 100).toFixed(2)}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" style="display: inline-block; margin-top: 20px; padding: 12px 32px; background: #E5C07B; color: #0A0A0A; text-decoration: none; border-radius: 8px; font-weight: 600;">View Order</a>
      </div>
    `,
  });
}
