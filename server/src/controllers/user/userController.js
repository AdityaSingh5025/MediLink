import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Profile from "../../models/Profile.js";
import Listing from "../../models/Listing.js";
import Request from "../../models/Request.js";
import Chat from "../../models/Chat.js";
import Leaderboard from "../../models/Leaderboard.js";
import { mailer } from "../../config/nodeMailer.js";
import { templates } from "../../templates/template.js";

dotenv.config();

export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update. Provide name or email.",
      });
    }

    const updates = {};

    if (name) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }
      updates.name = name.trim();
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && !existingUser._id.equals(userId)) {
        return res.status(409).json({
          success: false,
          message: "Email already registered by another user",
        });
      }

      updates.email = normalizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -hashedOtp -otpExpiry -resetPasswordToken");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User info updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateUserInfo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user info",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.password || user.googleId) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google login. Please use 'Forgot Password' to set a password.",
      });
    }

    const validOld = await bcrypt.compare(oldPassword, user.password);
    if (!validOld) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("updatePassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link will be sent.",
      });
    }

    let token;
    let hashedToken;

    // Check if there's already a valid token
    if (
      user.resetPasswordToken &&
      user.resetPasswordTokenExpires > Date.now()
    ) {
      // Generate new token anyway for security
      token = crypto.randomBytes(32).toString("hex");
      hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordTokenExpires = Date.now() + 30 * 60 * 1000;
      await user.save();
    } else {
      // Generate new token
      token = crypto.randomBytes(32).toString("hex");
      hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordTokenExpires = Date.now() + 30 * 60 * 1000; // 30 min
      await user.save();
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    const htmlTemplate = templates.resetLink
      .replace("{{resetLink}}", resetUrl)
      .replace("{{year}}", new Date().getFullYear());

    try {
      const result = await mailer(
        user.email,
        "Password Reset Link",
        htmlTemplate
      );

      if (!result || !result.success) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        await user.save();

        return res.status(500).json({
          success: false,
          message: "Failed to send email. Please try again later.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Password reset link sent successfully to your email.",
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);

      // Rollback token
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset request failed",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, resetPasswordToken } = req.body;

    if (!newPassword || !confirmNewPassword || !resetPasswordToken) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetPasswordToken)
      .digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashedToken });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (user.resetPasswordTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired. Please request a new password reset link.",
      });
    }

    if (user.password && (await bcrypt.compare(newPassword, user.password))) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    try {
      const htmlTemplate = templates.resetSuccess
        .replace("{{name}}", user.name || "User")
        .replace("{{year}}", new Date().getFullYear());

      await mailer(user.email, "Password Reset Successful", htmlTemplate);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue anyway - password was already reset
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete Google account this way. Please contact support.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    try {
      await Promise.all([
        Profile.findOneAndDelete({ user: userId }),
        Listing.deleteMany({ ownerId: userId }),
        Request.deleteMany({
          $or: [{ requesterId: userId }, { ownerId: userId }],
        }),
        Chat.deleteMany({ participants: userId }),
        Leaderboard.findOneAndDelete({ userId }),
      ]);

      // Delete user last
      await User.findByIdAndDelete(userId);

      try {
        const htmlTemplate = templates.deleteAccount
          .replace("{{name}}", user.name || "User")
          .replace("{{year}}", new Date().getFullYear());

        await mailer(user.email, "Account Deleted", htmlTemplate);
      } catch (emailError) {
        console.error("Failed to send deletion email:", emailError);
        // Continue anyway - account was already deleted
      }

      return res.status(200).json({
        success: true,
        message: "Account and all related data deleted successfully",
      });
    } catch (deleteError) {
      console.error("Error during cascade delete:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Failed to delete all account data. Please contact support.",
      });
    }
  } catch (error) {
    console.error("deleteAccount error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};
