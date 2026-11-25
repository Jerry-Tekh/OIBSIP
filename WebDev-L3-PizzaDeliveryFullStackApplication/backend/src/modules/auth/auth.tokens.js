import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function createOpaqueToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createAccessToken(user, sessionId) {
  return jwt.sign({
    sub: user._id.toString(),
    sid: sessionId.toString(),
    role: user.role
  }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
    issuer: "pizza-delivery-api",
    audience: "pizza-delivery-client"
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET, {
    issuer: "pizza-delivery-api",
    audience: "pizza-delivery-client"
  });
}

export function splitRefreshToken(token) {
  if (typeof token !== "string") return null;
  const separator = token.indexOf(".");
  if (separator < 1 || separator === token.length - 1) return null;
  return {
    sessionId: token.slice(0, separator),
    secret: token.slice(separator + 1)
  };
}
