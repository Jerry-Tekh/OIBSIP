import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../src/app.js";
import { registerSchema } from "../src/modules/auth/auth.validation.js";
import { splitRefreshToken, hashToken } from "../src/modules/auth/auth.tokens.js";

describe("Authentication security boundaries", () => {
  it("does not accept a role from public registration input", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "Test Customer",
        email: "customer@example.com",
        password: "StrongPassword!123",
        role: "admin"
      }
    });
    expect(result.success).toBe(true);
    expect(result.data.body.role).toBeUndefined();
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.safeParse({
      body: { name: "Test Customer", email: "customer@example.com", password: "password" }
    });
    expect(result.success).toBe(false);
  });

  it("rejects protected requests without an access token", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("splits refresh tokens into a session identifier and secret", () => {
    expect(splitRefreshToken("session-id.secret-value")).toEqual({
      sessionId: "session-id", secret: "secret-value"
    });
    expect(splitRefreshToken("invalid-token")).toBeNull();
    expect(splitRefreshToken(null)).toBeNull();
  });

  it("hashes refresh tokens consistently without storing the raw token", () => {
    const token = "sensitive-refresh-secret";
    const hashed = hashToken(token);
    expect(hashed).not.toBe(token);
    expect(hashed).toBe(hashToken(token));
  });
});
