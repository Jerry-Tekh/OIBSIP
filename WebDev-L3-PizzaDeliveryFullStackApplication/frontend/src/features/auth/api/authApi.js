const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

let accessToken = null;
let currentUser = null;
let restorePromise = null;

export function getAccessToken() { return accessToken; }
export function getCurrentUser() { return currentUser; }

async function readPayload(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success !== true) {
    const error = new Error(payload.message || fallbackMessage);
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }
  return payload.data;
}

async function authRequest(path, body, fallbackMessage) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  });
  return readPayload(response, fallbackMessage);
}

export async function signIn({ email, password }) {
  const data = await authRequest("login", { email, password }, "We couldn't sign you in. Please try again.");
  accessToken = data?.accessToken ?? null;
  currentUser = data?.user ?? null;
  return data;
}

export async function restoreAuthenticatedUser() {
  if (currentUser && accessToken) return currentUser;
  if (restorePromise) return restorePromise;
  restorePromise = (async () => {
    try {
      if (!accessToken) {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json", "X-Refresh-Request": "1" },
          body: "{}"
        });
        const data = await readPayload(response, "Your session has expired. Please sign in again.");
        accessToken = data?.accessToken ?? null;
      }
      if (!accessToken) throw new Error("No active access token.");
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include", headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await readPayload(response, "Your session is no longer valid. Please sign in again.");
      currentUser = data?.user ?? null;
      if (!currentUser?.role) throw new Error("The authenticated user role is missing.");
      return currentUser;
    } catch (error) {
      accessToken = null;
      currentUser = null;
      throw error;
    } finally {
      restorePromise = null;
    }
  })();
  return restorePromise;
}

export async function signOut() {
  try {
    await authRequest("logout", {}, "We couldn't sign you out. Please try again.");
  } finally {
    accessToken = null;
    currentUser = null;
  }
}

export function signUp({ name, email, password }) {
  return authRequest("register", { name, email, password }, "We couldn't create your account. Please try again.");
}
export function verifyEmail(token) {
  return authRequest("verify-email", { token }, "We could not verify your email address. Please try again.");
}
