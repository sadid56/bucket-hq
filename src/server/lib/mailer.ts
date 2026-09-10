import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  if (process.env.GOOGLE_APP_EMAIL && process.env.GOOGLE_APP_PASSWORD) {
    try {
      await transporter.sendMail({
        from: `"BucketHQ" <${process.env.GOOGLE_APP_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true, simulated: true };
}

export async function sendTeamInviteEmail({
  to,
  inviterName,
  orgName,
  role,
  inviteUrl,
}: {
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
}) {
  const subject = `You've been invited to join ${orgName} on BucketHQ`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0b0c10; color: #f1f5f9; margin: 0; padding: 40px 20px; }
    .container { max-width: 540px; margin: 0 auto; background: #12141d; border: 1px solid #1f2231; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .brand { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; color: #14b8a6; margin-bottom: 24px; }
    h2 { font-size: 22px; margin-top: 0; color: #ffffff; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .highlight { color: #ffffff; font-weight: 600; }
    .btn-wrapper { margin: 32px 0; text-align: center; }
    .btn { background: #0d9488; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1f2231; font-size: 12px; color: #64748b; line-height: 1.5; }
    .link-fallback { word-break: break-all; color: #14b8a6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">BucketHQ</div>
    <h2>Join ${orgName}</h2>
    <p>Hi there,</p>
    <p><span class="highlight">${inviterName}</span> has invited you to collaborate in the <span class="highlight">${orgName}</span> workspace on BucketHQ as <span class="highlight">${role}</span>.</p>
    <div class="btn-wrapper">
      <a href="${inviteUrl}" class="btn" target="_blank">Accept Invitation & Join Team</a>
    </div>
    <p>This invitation link will expire in 7 days. If you do not have a BucketHQ account yet, clicking the button will guide you through a quick sign-up.</p>
    <div class="footer">
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${inviteUrl}" class="link-fallback">${inviteUrl}</a>
    </div>
  </div>
</body>
</html>
  `;

  const text = `You've been invited by ${inviterName} to join ${orgName} as ${role} on BucketHQ.\n\nAccept your invitation by visiting: ${inviteUrl}\n\nThis invitation expires in 7 days.`;

  return await sendEmail({ to, subject, html, text });
}
