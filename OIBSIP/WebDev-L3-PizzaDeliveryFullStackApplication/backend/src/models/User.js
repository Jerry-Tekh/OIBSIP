import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
    immutable: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationTokenHash: {
    type: String,
    select: false
  },
  emailVerificationExpiresAt: Date,
  passwordResetTokenHash: {
    type: String,
    select: false
  },
  passwordResetExpiresAt: Date
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
