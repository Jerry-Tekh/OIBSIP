import { z } from "zod";

const email = z.string().trim().email().max(254).transform(value => value.toLowerCase());
const password = z.string()
  .min(12, "Password must contain at least 12 characters.")
  .max(128)
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character.");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    password
  })
});

export const loginSchema = z.object({
  body: z.object({ email, password: z.string().min(1).max(128) })
});

export const emailSchema = z.object({
  body: z.object({ email })
});

export const verifyEmailSchema = z.object({
  body: z.object({ token: z.string().min(32).max(256) })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(32).max(256),
    newPassword: password
  })
});

export const sessionIdSchema = z.object({
  params: z.object({ sessionId: z.string().min(1) })
});
