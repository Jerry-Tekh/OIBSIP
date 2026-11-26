const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

async function authRequest(path, body, fallbackMessage) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success !== true) {
    const error = new Error(payload.message || fallbackMessage);
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }
  return payload.data;
}

export async function signIn({ email, password }) {
  const data = await authRequest("login", { email, password }, "We couldn't sign you in. Please try again.");
  accessToken = data?.accessToken ?? null;
  return data;
}

/**
 * Revoke the current server-side session using its HttpOnly refresh cookie.
 * Clear the in-memory access token only after the API confirms logout.
 */
export async function signOut() {
  await authRequest("logout", {}, "We couldn't sign you out. Please try again.");
  accessToken = null;
}

export function signUp({ name, email, password }) {
  return authRequest("register", { name, email, password }, "We couldn't create your account. Please try again.");
}

export function verifyEmail(token) {
  return authRequest("verify-email", { token }, "We could not verify your email address. Please try again.");
}
