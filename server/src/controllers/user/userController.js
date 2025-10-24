import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../../models/User.js";
import { mailer } from "../../config/nodeMailer.js";
import { templates } from "../../templates/template.js";
import Profile from "../../models/Profile.js";

dotenv.config();

export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email, accountType } = req.body;

    if (!name && !email && !accountType) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (accountType) updates.accountType = accountType.trim();

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser && !existingUser._id.equals(userId)) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      updates.email = normalizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User info updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const validOld = await bcrypt.compare(oldPassword, user.password);
    if (!validOld) {
      return res.status(400).json({ success: false, message: "Old password incorrect" });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ success: false, message: "New password cannot be same as old one" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, message: error.message });
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

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link will be sent.",
      });
    }

    let token;
    let hashedToken;

    // if there’s already a token and it hasn’t expired, reuse it and resend email
    if (user.resetPasswordToken && user.resetPasswordTokenExpires > Date.now()) {
      // console.log("Existing valid token found, resending reset link...,",user.resetPasswordToken);
      hashedToken = user.resetPasswordToken;

      // we can’t reverse-hash, so just inform user we re-sent
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/<existing_token_in_mail>`;
      const htmlTemplate = templates.resetLink
        .replace("{{resetLink}}", resetUrl)
        .replace("{{year}}", new Date().getFullYear());

      const mailSent = await mailer(user.email, "Password Reset Link", htmlTemplate);

      if (!mailSent) {
        return res.status(400).json({
          success: false,
          message: "Failed to resend email. Try again later.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Password reset link resent successfully.",
      });
    }

    // Otherwise, generate new token
    token = crypto.randomBytes(32).toString("hex");
    hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires = Date.now() + 30 * 60 * 1000; 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    // console.log(token);
    
    const htmlTemplate = templates.resetLink
      .replace("{{resetLink}}", resetUrl)
      .replace("{{year}}", new Date().getFullYear());

    const mailSent = await mailer(user.email, "Password Reset Link", htmlTemplate);

    if (!mailSent) {
      return res.status(400).json({
        success: false,
        message: "Failed to send email. Try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, resetPasswordToken } = req.body;

    if (!newPassword || !confirmNewPassword || !resetPasswordToken) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const hashedToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashedToken });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (user.resetPasswordTokenExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Token expired, please request a new one" });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ success: false, message: "New password cannot be same as old one" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    const htmlTemplate = templates.resetSuccess
      .replace("{{name}}", user.name || "User")
      .replace("{{year}}", new Date().getFullYear());

    await mailer(user.email, "Password Reset Successful", htmlTemplate);

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }
    await Profile.findOneAndDelete({ user: userId });
    await User.findByIdAndDelete(userId);

    const htmlTemplate = templates.deleteAccount
      .replace("{{name}}", user.name || "User")
      .replace("{{year}}", new Date().getFullYear());

    await mailer(user.email, "Account Deleted", htmlTemplate);

    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};