const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success !== true) {
    const error = new Error(
      payload?.error?.message ||
      payload?.message ||
      "We couldn't load the pizza catalogue. Please try again."
    );
    error.status = response.status;
    throw error;
  }

  return payload.data;
}

export async function getPublicProducts({ page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/api/v1/products?${params.toString()}`);
}

export async function getPublicProduct(slug) {
  if (!slug) throw new Error("A product URL slug is required.");
  return request(`/api/v1/products/${encodeURIComponent(slug)}`);
}
