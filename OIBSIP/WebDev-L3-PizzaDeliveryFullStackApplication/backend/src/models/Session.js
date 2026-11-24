import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  refreshTokenHash: {
    type: String,
    required: true,
    select: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  revokedAt: {
    type: Date,
    default: null,
    index: true
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    maxlength: 100
  }
}, {
  timestamps: true,
  versionKey: false
});

// MongoDB removes expired session documents in the background.
// Application queries still check expiresAt explicitly; TTL cleanup is not immediate.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Session", sessionSchema);
