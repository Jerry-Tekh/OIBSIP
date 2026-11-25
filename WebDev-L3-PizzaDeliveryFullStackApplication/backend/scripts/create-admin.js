import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import User from "../src/models/User.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { logger } from "../src/utils/logger.js";

async function createAdmin() {
  const name = env.ADMIN_NAME.trim();
  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before running this command.");
  }

  if (password.length < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");

  await connectDatabase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role === "admin") {
      logger.info({ email }, "An administrator with this email already exists");
      return;
    }
    throw new Error("This email already belongs to a customer. Use a different email for the administrator.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    isEmailVerified: true
  });

  logger.info({ email }, "Administrator account created");
}

try {
  await createAdmin();
} catch (error) {
  logger.error({ err: error }, "Administrator provisioning failed");
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) await disconnectDatabase();
}
