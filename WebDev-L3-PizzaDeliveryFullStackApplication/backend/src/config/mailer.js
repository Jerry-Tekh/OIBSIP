import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";

const BREVO_SEND_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

function getEmailConfig() {
  if (!env.BREVO_API_KEY || !env.EMAIL_FROM_EMAIL) {
    throw new ApiError(503, "Email delivery is not configured. Configure Brevo API credentials first.");
  }
  return { apiKey: env.BREVO_API_KEY, sender: { email: env.EMAIL_FROM_EMAIL, name: env.EMAIL_FROM_NAME } };
}

/**
 * Sends transactional email through Brevo's HTTPS API (no SMTP socket required).
 * Uses native fetch, available in supported Node.js versions.
 */
export async function sendEmail({ to, subject, text, html }) {
  const config = getEmailConfig();
  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

  if (!recipients.length || recipients.some((recipient) => typeof recipient.email !== "string" || !recipient.email.trim())) {
    throw new ApiError(400, "A valid email recipient is required.");
  }

  const payload = {
    sender: config.sender,
    to: recipients,
    subject,
    ...(text ? { textContent: text } : {}),
    ...(html ? { htmlContent: html } : {}),
  };

  let response;
  try {
    response = await fetch(BREVO_SEND_ENDPOINT, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": config.apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    // Keep provider credentials and message contents out of application logs/errors.
    throw new ApiError(503, "Email provider could not be reached. Please try again later.");
  }

  if (!response.ok) {
    // Avoid exposing raw provider response which can contain internal details.
    throw new ApiError(502, "The email provider rejected the message. Please try again later.");
  }

  let result = {};
  try {
    result = await response.json();
  } catch {
    // Brevo may return a response without a JSON body; successful HTTP status is sufficient.
  }
  return { messageId: result.messageId, provider: "brevo" };
}
