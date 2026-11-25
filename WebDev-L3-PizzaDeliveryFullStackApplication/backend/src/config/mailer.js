import nodemailer from "nodemailer";
import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";

let transporter;

function getTransporter() {
  if (!env.SMTP_HOST) {
    throw new ApiError(503, "Email delivery is not configured. Configure the SMTP settings first.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      }
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  return getTransporter().sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  });
}
