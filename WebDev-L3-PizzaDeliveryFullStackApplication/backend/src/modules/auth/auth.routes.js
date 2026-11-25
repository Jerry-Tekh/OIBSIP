import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import * as authController from "./auth.controller.js";
import { authenticate, authorize } from "./auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionIdSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

const router = Router();

const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

const emailActionLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post(
  "/register",
  authAttemptLimit,
  validate(registerSchema),
  authController.register,
);
router.post(
  "/verify-email",
  emailActionLimit,
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
router.post(
  "/verification/resend",
  emailActionLimit,
  validate(emailSchema),
  authController.resendVerification,
);
router.post(
  "/login",
  authAttemptLimit,
  validate(loginSchema),
  authController.login,
);
router.post("/refresh", emailActionLimit, authController.refresh);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.post(
  "/password/forgot",
  emailActionLimit,
  validate(emailSchema),
  authController.requestPasswordReset,
);
router.post(
  "/password/reset",
  emailActionLimit,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

router.get("/me", authenticate, authController.currentUser);
router.get("/sessions", authenticate, authController.listSessions);
router.delete(
  "/sessions/:sessionId",
  authenticate,
  validate(sessionIdSchema),
  authController.revokeSession,
);
router.get("/admin-check", authenticate, authorize("admin"), (req, res) => {
  res.json({ success: true, data: { access: "admin" } });
});

export default router;
