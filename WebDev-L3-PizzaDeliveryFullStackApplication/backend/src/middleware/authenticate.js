import { verifyAccessToken } from "../utils/authTokens.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication is required.");
  }

  let claims;
  try {
    claims = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Your access token is invalid or has expired.");
  }

  const session = await Session.findOne({
    _id: claims.sid,
    userId: claims.sub,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!session) throw new ApiError(401, "Your session is no longer active.");

  // Read current user data so role changes and account changes take effect immediately.
  const user = await User.findById(claims.sub);

  if (!user || !user.isEmailVerified) {
    throw new ApiError(401, "This account is not available.");
  }

  req.user = user;
  req.sessionId = session._id.toString();
  next();
});
