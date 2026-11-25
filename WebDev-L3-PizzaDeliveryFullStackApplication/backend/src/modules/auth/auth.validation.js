import { z } from "zod";

const email = z.string().trim().max(254).email().transform(value => value.toLowerCase());
const password = z.string()
  .min(12, "Password must contain at least 12 characters.")
  .max(128, "Password must contain no more than 128 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character.");

const customerName = z.string()
  .trim()
  .min(2, "Name must contain at least 2 characters.")
  .max(80, "Name must contain no more than 80 characters.")
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, "Name contains unsupported characters.");

export const registerSchema = z.object({
  body: z.object({ name: customerName, email, password })
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password is required.").max(128, "Password must contain no more than 128 characters.")
  })
});

export const emailSchema = z.object({ body: z.object({ email }) });
export const verifyEmailSchema = z.object({ body: z.object({ token: z.string().min(32).max(256) }) });

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(32).max(256), newPassword: password })
});

export const sessionIdSchema = z.object({
  params: z.object({ sessionId: z.string().min(1).max(128) })
});
