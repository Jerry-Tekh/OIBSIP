import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "./user.model.js";
import Session from "./session.model.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";
import {
  createAccessToken,
  createOpaqueToken,
  hashToken,
  splitRefreshToken,
} from "./auth.tokens.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./auth.email.service.js";

const PASSWORD_COST = 12;
const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_LIFETIME_MS = 30 * 60 * 1000;

function createRefreshCookieValue(sessionId, secret) {
  return `${sessionId}.${secret}`;
}

function getSessionExpiry() {
  return new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
}

async function createSession(user, request) {
  const refreshSecret = createOpaqueToken();
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: hashToken(refreshSecret),
    expiresAt: getSessionExpiry(),
    userAgent: request.get("user-agent")?.slice(0, 500),
    ipAddress: request.ip,
  });
  return {
    session,
    refreshToken: createRefreshCookieValue(session._id, refreshSecret),
  };
}

function createVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function registerCustomer({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.exists({ email: normalizedEmail });
  if (existingUser)
    throw new ApiError(409, "An account with this email already exists.");

  const verificationToken = createVerificationToken();
  const passwordHash = await bcrypt.hash(password, PASSWORD_COST);

  let user;
  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "customer",
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpiresAt: new Date(
        Date.now() + VERIFICATION_TOKEN_LIFETIME_MS,
      ),
    });
  } catch (error) {
    // The unique index is authoritative when two registrations race.
    if (error?.code === 11000)
      throw new ApiError(409, "An account with this email already exists.");
    throw error;
  }

  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (error) {
    logger.error(
      { err: error, userId: user._id },
      "Verification email could not be sent",
    );
    throw new ApiError(
      503,
      "Your account was created, but the verification email could not be sent. Request another verification email.",
    );
  }

  return {
    user: publicUser(user),
    message: "Account created. Check your email to verify your account.",
  };
}

export async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select("+emailVerificationTokenHash");
  if (!user)
    throw new ApiError(
      400,
      "This verification link is invalid or has expired.",
    );

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();
  return {
    user: publicUser(user),
    message: "Email address verified. You can now sign in.",
  };
}

export async function resendVerificationEmail(email) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || user.isEmailVerified) {
    return {
      message:
        "If an unverified account exists for that email, a verification message will be sent.",
    };
  }

  const token = createVerificationToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_LIFETIME_MS,
  );
  await user.save();
  try {
    await sendVerificationEmail(user, token);
  } catch (error) {
    logger.error(
      { err: error, userId: user._id },
      "Verification email resend failed",
    );
    throw new ApiError(
      503,
      "The verification email could not be sent. Please try again later.",
    );
  }
  return {
    message:
      "If an unverified account exists for that email, a verification message will be sent.",
  };
}

export async function login({ email, password }, request) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash",
  );
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!user.isEmailVerified)
    throw new ApiError(403, "Verify your email address before signing in.");

  const { session, refreshToken } = await createSession(user, request);
  return {
    user: publicUser(user),
    accessToken: createAccessToken(user, session._id),
    refreshToken,
    refreshTokenExpiresAt: session.expiresAt,
  };
}

export async function refreshSession(refreshCookie, request) {
  const parsed = splitRefreshToken(refreshCookie);
  if (!parsed || !mongoose.isValidObjectId(parsed.sessionId)) {
    throw new ApiError(401, "Your session is invalid. Please sign in again.");
  }

  const session = await Session.findById(parsed.sessionId).select(
    "+refreshTokenHash",
  );
  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const suppliedHash = hashToken(parsed.secret);
  if (suppliedHash !== session.refreshTokenHash) {
    session.revokedAt = new Date();
    await session.save();
    logger.warn(
      { sessionId: session._id, userId: session.userId },
      "Refresh token reuse detected; session revoked",
    );
    throw new ApiError(
      401,
      "This session is no longer valid. Please sign in again.",
    );
  }

  const user = await User.findById(session.userId);
  if (!user || !user.isEmailVerified) {
    session.revokedAt = new Date();
    await session.save();
    throw new ApiError(
      401,
      "This session is no longer valid. Please sign in again.",
    );
  }

  const nextSecret = createOpaqueToken();
  const nextExpiry = getSessionExpiry();
  const rotatedSession = await Session.findOneAndUpdate(
    {
      _id: session._id,
      refreshTokenHash: suppliedHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        refreshTokenHash: hashToken(nextSecret),
        expiresAt: nextExpiry,
        userAgent: request.get("user-agent")?.slice(0, 500),
        ipAddress: request.ip,
      },
    },
    { new: true },
  );

  if (!rotatedSession) {
    // A competing refresh may have consumed this token; fail closed and revoke the session.
    await Session.updateOne(
      { _id: session._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    throw new ApiError(
      401,
      "This session has already been used. Please sign in again.",
    );
  }

  return {
    accessToken: createAccessToken(user, rotatedSession._id),
    refreshToken: createRefreshCookieValue(rotatedSession._id, nextSecret),
    refreshTokenExpiresAt: rotatedSession.expiresAt,
  };
}

export async function revokeSession(refreshCookie) {
  const parsed = splitRefreshToken(refreshCookie);
  if (!parsed || !mongoose.isValidObjectId(parsed.sessionId)) return;
  const session = await Session.findById(parsed.sessionId).select(
    "+refreshTokenHash",
  );
  if (!session || session.revokedAt) return;
  if (hashToken(parsed.secret) === session.refreshTokenHash) {
    session.revokedAt = new Date();
    await session.save();
  }
}

export async function revokeAllSessions(userId) {
  await Session.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user)
    return {
      message:
        "If an account exists for that email, a password reset message will be sent.",
    };

  const token = createVerificationToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(
    Date.now() + PASSWORD_RESET_LIFETIME_MS,
  );
  await user.save();
  try {
    await sendPasswordResetEmail(user, token);
  } catch (error) {
    logger.error(
      { err: error, userId: user._id },
      "Password reset email could not be sent",
    );
    throw new ApiError(
      503,
      "The password reset email could not be sent. Please try again later.",
    );
  }
  return {
    message:
      "If an account exists for that email, a password reset message will be sent.",
  };
}

export async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash");
  if (!user)
    throw new ApiError(
      400,
      "This password reset link is invalid or has expired.",
    );

  user.passwordHash = await bcrypt.hash(newPassword, PASSWORD_COST);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  await revokeAllSessions(user._id);
  return { message: "Password updated. Sign in with your new password." };
}

export function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

export async function getActiveSessions(userId, currentSessionId) {
  const sessions = await Session.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  return sessions.map((session) => ({
    id: session._id,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    current: session._id.toString() === currentSessionId,
  }));
}

export async function revokeOneSession(userId, sessionId) {
  if (!mongoose.isValidObjectId(sessionId))
    throw new ApiError(404, "Session not found.");
  const result = await Session.updateOne(
    { _id: sessionId, userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  if (!result.modifiedCount)
    throw new ApiError(404, "Session not found or already revoked.");
}
