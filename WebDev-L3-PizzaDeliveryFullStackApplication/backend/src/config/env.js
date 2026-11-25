import dotenv from "dotenv";
import { z } from "zod";

// Load local .env values before validating the configuration.
dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET must contain at least 32 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  AUTH_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),

  BREVO_API_KEY: z.string().optional().default(""),
  EMAIL_FROM_EMAIL: z.string().email().optional().or(z.literal("")).default(""),
  EMAIL_FROM_NAME: z.string().optional().default("Pizza Delivery"),

  ADMIN_NAME: z.string().optional().default(""),
  ADMIN_EMAIL: z.string().email().optional().or(z.literal("")).default(""),
  ADMIN_PASSWORD: z.string().optional().default("")
}).superRefine((values, context) => {
  const emailValues = [values.BREVO_API_KEY, values.EMAIL_FROM_EMAIL];
  const configuredCount = emailValues.filter(Boolean).length;

  // Email delivery is optional during API startup, but Brevo configuration must be complete when used.
  if (configuredCount > 0 && configuredCount !== emailValues.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Configure BREVO_API_KEY and EMAIL_FROM_EMAIL together",
      path: ["BREVO_API_KEY"]
    });
  }

  if (values.AUTH_COOKIE_SAME_SITE === "none" && values.NODE_ENV !== "production") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "SameSite=None requires secure production cookies",
      path: ["AUTH_COOKIE_SAME_SITE"]
    });
  }
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("Environment configuration error:", result.error.flatten().fieldErrors);
  process.exit(1);
}

// Freeze the validated configuration so other modules cannot mutate it.
export const env = Object.freeze(result.data);
