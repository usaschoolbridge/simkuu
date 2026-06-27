/**
 * Email service via Resend.
 *
 * Production setup:
 *   1. npm install resend
 *   2. Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local
 *   3. Verify your domain at https://resend.com/domains
 *   4. Uncomment the Resend import and remove the mock below
 */

// import { Resend } from "resend";
// const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@simkuu.com";
const SUPPORT = "support@simkuu.com";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ── Mock sender (dev) ─────────────────────────────────────────────────────────

async function mockSend(to: string, subject: string, _html: string): Promise<SendResult> {
  console.log(`[Email MOCK] → ${to}\n  Subject: ${subject}`);
  return { success: true, id: `mock_${Date.now()}` };
}

// ── Email templates ───────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Simkuu</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:32px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);width:40px;height:40px;border-radius:10px;text-align:center;vertical-align:middle;">
                  <span style="color:white;font-size:20px;">📶</span>
                </td>
                <td style="padding-left:12px;">
                  <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Simkuu</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;background:#f9f9f9;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
              © ${new Date().getFullYear()} Simkuu · <a href="https://simkuu.com" style="color:#6b7280;text-decoration:none;">simkuu.com</a><br/>
              Need help? <a href="mailto:${SUPPORT}" style="color:#6b7280;">${SUPPORT}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email functions ───────────────────────────────────────────────────────────

/** Welcome email after registration */
export async function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  const subject = "Welcome to Simkuu 👋";
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#000;letter-spacing:-0.5px;">Welcome, ${name}!</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">
      Your Simkuu account is ready. You're now one step away from instant USA connectivity.
    </p>
    <a href="https://simkuu.com/plans" style="display:inline-block;background:#000;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
      Browse Plans →
    </a>
    <p style="margin:32px 0 0;color:#9ca3af;font-size:13px;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `);

  // return resend.emails.send({ from: FROM, to, subject, html });
  return mockSend(to, subject, html);
}

/** Order confirmation with eSIM QR delivery */
export async function sendOrderConfirmation(
  to: string,
  { name, orderId, planName, carrier, activationCode, qrUrl }: {
    name: string; orderId: string; planName: string; carrier: string;
    activationCode: string; qrUrl?: string;
  }
): Promise<SendResult> {
  const subject = `Your eSIM is ready — Order #${orderId}`;
  const html = baseTemplate(`
    <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 16px;margin-bottom:24px;">
      <span style="color:#16a34a;font-weight:700;font-size:13px;">✓ Payment confirmed</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#000;">Your eSIM is ready, ${name}!</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Your <strong>${planName}</strong> on <strong>${carrier}</strong> is activated and ready to use.
    </p>
    ${qrUrl ? `<div style="text-align:center;margin:0 0 24px;"><img src="${qrUrl}" width="200" height="200" alt="eSIM QR Code" style="border-radius:12px;border:2px solid #e5e7eb;" /></div>` : ""}
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Activation Code</p>
      <p style="margin:0;font-family:monospace;font-size:14px;color:#000;word-break:break-all;">${activationCode}</p>
    </div>
    <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#000;">How to activate</h2>
    <ol style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
      <li>Open <strong>Settings</strong> on your phone</li>
      <li>Tap <strong>Cellular / Mobile Data → Add Plan</strong></li>
      <li>Select <strong>Scan QR Code</strong> and point at the QR above</li>
      <li>Follow prompts — you'll be connected within 2 minutes</li>
    </ol>
    <a href="https://simkuu.com/dashboard" style="display:inline-block;background:#000;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
      View in Dashboard →
    </a>
  `);

  // return resend.emails.send({ from: FROM, to, subject, html });
  return mockSend(to, subject, html);
}

/** Password reset */
export async function sendPasswordReset(to: string, resetUrl: string): Promise<SendResult> {
  const subject = "Reset your Simkuu password";
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#000;">Reset your password</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      We received a request to reset your password. Click the button below — this link expires in 1 hour.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background:#000;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
      Reset Password →
    </a>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      If you didn't request this, you can safely ignore this email. Your password won't change.
    </p>
  `);

  // return resend.emails.send({ from: FROM, to, subject, html });
  return mockSend(to, subject, html);
}

/** Email verification OTP */
export async function sendEmailVerification(to: string, otp: string): Promise<SendResult> {
  const subject = "Verify your Simkuu email";
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#000;">Verify your email</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Enter this code in the verification screen. It expires in 10 minutes.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <span style="display:inline-block;background:#000;color:#fff;font-family:monospace;font-size:36px;font-weight:900;letter-spacing:12px;padding:20px 32px;border-radius:12px;">
        ${otp}
      </span>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
      Didn't request this? Ignore this email.
    </p>
  `);

  // return resend.emails.send({ from: FROM, to, subject, html });
  return mockSend(to, subject, html);
}

/** Plan expiry reminder */
export async function sendPlanExpiryReminder(
  to: string,
  { name, planName, expiresAt, renewUrl }: {
    name: string; planName: string; expiresAt: string; renewUrl: string;
  }
): Promise<SendResult> {
  const subject = `Your ${planName} plan expires soon`;
  const html = baseTemplate(`
    <div style="display:inline-block;background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:8px 16px;margin-bottom:24px;">
      <span style="color:#854d0e;font-weight:700;font-size:13px;">⚠ Expiring soon</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#000;">Hey ${name}, your plan expires ${expiresAt}</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Your <strong>${planName}</strong> plan is expiring soon. Renew now to stay connected without interruption.
    </p>
    <a href="${renewUrl}" style="display:inline-block;background:#000;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
      Renew Plan →
    </a>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      If you don't renew, your service pauses automatically. Your number is preserved for 30 days.
    </p>
  `);

  // return resend.emails.send({ from: FROM, to, subject, html });
  return mockSend(to, subject, html);
}
