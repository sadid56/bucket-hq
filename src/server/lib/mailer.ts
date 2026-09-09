import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  await transporter.sendMail({
    from: `"NexG Lab" <${process.env.GOOGLE_APP_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}
