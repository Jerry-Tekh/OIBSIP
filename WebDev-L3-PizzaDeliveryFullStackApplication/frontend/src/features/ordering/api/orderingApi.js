import { getAccessToken } from "../../auth/api/authApi.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, { method = "GET", body, idempotencyKey } = {}) {
  const token = getAccessToken();
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch(`${API_BASE_URL}${path}`, { method, credentials: "include", headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success !== true) {
    const error = new Error(payload?.error?.message || payload?.message || "We couldn't complete that request. Please try again.");
    error.status = response.status; error.details = payload?.error?.details; throw error;
  }
  return payload.data;
}
export function getPizzaOptions(productSlug) { return request("/api/v1/catalog/builder-options/" + encodeURIComponent(productSlug)); }
export function previewConfiguration(items) { return request("/api/v1/checkout/preview", { method: "POST", body: { items } }); }
export function createCheckout({ items, deliveryAddress, idempotencyKey }) { return request("/api/v1/checkout", { method: "POST", body: { items, deliveryAddress }, idempotencyKey }); }
export function simulatePaymentSuccess() { return Promise.reject(new Error("Demo payment is disabled. Complete the configured payment-provider integration before accepting payments.")); }
