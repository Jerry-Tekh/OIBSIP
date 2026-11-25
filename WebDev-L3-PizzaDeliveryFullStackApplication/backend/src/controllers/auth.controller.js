import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

const REFRESH_COOKIE_NAME = "pizza_refresh";

function refreshCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: "/api/auth",
    expires: expiresAt
  };
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: "/api/auth"
  });
}

function setRefreshCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(expiresAt));
}

function requireRefreshRequest(req) {
  // Require the exact frontend origin and a custom header on cookie-authenticated refresh.
  if (req.get("origin") !== env.CLIENT_ORIGIN || req.get("x-refresh-request") !== "1") {
    throw new ApiError(403, "This refresh request was not accepted.");
  }
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCustomer(req.validated.body);
  res.status(201).json({ success: true, data: result });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.validated.body.token);
  res.status(200).json({ success: true, data: result });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerificationEmail(req.validated.body.email);
  res.status(200).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body, req);
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

  res.status(200).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  requireRefreshRequest(req);
  const result = await authService.refreshSession(req.cookies[REFRESH_COOKIE_NAME], req);
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

  res.status(200).json({ success: true, data: { accessToken: result.accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.revokeSession(req.cookies[REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: "You have been signed out." });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.revokeAllSessions(req.user._id);
  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: "All sessions have been signed out." });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.validated.body.email);
  res.status(200).json({ success: true, data: result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.validated.body.token, req.validated.body.newPassword);
  res.status(200).json({ success: true, data: result });
});

export const currentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: authService.publicUser(req.user), sessionId: req.sessionId }
  });
});

export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getActiveSessions(req.user._id, req.sessionId);
  res.status(200).json({ success: true, data: { sessions } });
});

export const revokeSession = asyncHandler(async (req, res) => {
  await authService.revokeOneSession(req.user._id, req.validated.params.sessionId);
  res.status(200).json({ success: true, message: "Session revoked." });
});
