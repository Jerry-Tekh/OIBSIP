const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export async function signIn({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success !== true) {
    const error = new Error(payload.message || "We couldn't sign you in. Please try again.");
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }

  accessToken = payload.data?.accessToken ?? null;
  return payload.data;
}
