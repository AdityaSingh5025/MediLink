import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String }, //  optional if Google signup only

    googleId: { type: String, default: null }, // link Google account

    isVerified: { type: Boolean, default: false },

    // OTP related:
    hashedOtp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    lastOtpSentAt: Date,

    accountType: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    // forgot password
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
