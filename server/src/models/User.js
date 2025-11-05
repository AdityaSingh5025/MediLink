import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String }, // optional if Google signup only

    googleId: { type: String, default: null },

    isVerified: { type: Boolean, default: false },

    // OTP related:
    hashedOtp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    lastOtpSentAt: { type: Date, default: null },

    accountType: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
      required: true,
    },

    // Forgot password
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpires: { type: Date, default: null },

    // createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


userSchema.index({ googleId: 1 }, { sparse: true });


export default mongoose.model("User", userSchema);
