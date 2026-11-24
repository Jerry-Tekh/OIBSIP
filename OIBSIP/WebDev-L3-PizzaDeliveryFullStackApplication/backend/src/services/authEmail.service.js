import { env } from "../config/env.js";
import { sendEmail } from "../config/mailer.js";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

export async function sendVerificationEmail(user, token) {
  const link = new URL("/verify-email", env.CLIENT_ORIGIN);
  link.searchParams.set("token", token);
  const safeName = escapeHtml(user.name);

  await sendEmail({
    to: user.email,
    subject: "Verify your Pizza Delivery account",
    text: `Hello ${user.name}, verify your email by opening this link: ${link.toString()}`,
    html: `<p>Hello ${safeName},</p><p>Verify your email address to activate your account.</p><p><a href="${link.toString()}">Verify email address</a></p><p>This link expires in 24 hours.</p>`
  });
}

export async function sendPasswordResetEmail(user, token) {
  const link = new URL("/reset-password", env.CLIENT_ORIGIN);
  link.searchParams.set("token", token);
  const safeName = escapeHtml(user.name);

  await sendEmail({
    to: user.email,
    subject: "Reset your Pizza Delivery password",
    text: `Hello ${user.name}, reset your password using this link: ${link.toString()}`,
    html: `<p>Hello ${safeName},</p><p>We received a request to reset your password.</p><p><a href="${link.toString()}">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>`
  });
}
