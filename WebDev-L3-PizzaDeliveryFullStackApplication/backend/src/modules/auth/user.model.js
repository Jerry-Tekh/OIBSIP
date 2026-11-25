import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  // Public registration always creates customers; admin provisioning is a separate trusted operation.
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationTokenHash: { type: String, select: false },
  emailVerificationExpiresAt: Date,
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpiresAt: Date
}, { timestamps: true, versionKey: false });

export default mongoose.model("User", userSchema);
