import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { generateOtp } from "../../utils/generateOtp.js";
import { generateTokens } from "../../utils/generateTokens.js";
import { sendVerificationEmail } from "../../helper/verificationMail.js";

dotenv.config();

// signup controller
export const signup = async (req, res) => {
  try {
    const { email, password, name, accountType } = req.body;

    if (!email || !password || !name || !accountType) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    // check user already exist or he already signed up but did not verify email
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        if (
          existingUser.lastOtpSentAt &&
          Date.now() - existingUser.lastOtpSentAt.getTime() < 60 * 1000
        ) {
          return res.status(429).json({
            success: false,
            message: "Please wait 1 minute before requesting another OTP.",
          });
        }

        try {
          const { otp, hashedOtp, otpExpiry, lastOtpSentAt } =
            await generateOtp(email);

          existingUser.otpExpiry = otpExpiry;
          existingUser.hashedOtp = hashedOtp;
          existingUser.lastOtpSentAt = lastOtpSentAt;
          await existingUser.save();

          await sendVerificationEmail(email, otp);
          // console.log("email sent",otp);
          
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          return res.status(500).json({
            success: false,
            message: "Failed to send verification email. Please try again.",
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "User already signed up, Verification mail sent successfully",
        });
      }
      return res.status(400).json({
        success: false,
        message: "User already registered, please login",
      });
    }

    try {
      const { otp, hashedOtp, otpExpiry, lastOtpSentAt } = await generateOtp(
        email
      );
      const hashedPassword = await bcrypt.hash(password, 8);

      const user = await User.create({
        email: email,
        name: name,
        accountType,
        password: hashedPassword,
        hashedOtp: hashedOtp,
        isVerified: false,
        otpExpiry: otpExpiry,
        lastOtpSentAt: lastOtpSentAt,
      });

      await sendVerificationEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: "User created successfully, please verify your email",
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({
        success: false,
        message:
          "User created but failed to send verification email. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Signup failed. Please try again.",
    });
  }
};

// verify otp
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Already verified" });
    }

    if (!user.hashedOtp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found, please request again",
      });
    }

    if (!user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
      try {
        const {
          otp: newOtp,
          hashedOtp,
          otpExpiry,
          lastOtpSentAt,
        } = await generateOtp(email);
        user.hashedOtp = hashedOtp;
        user.otpExpiry = otpExpiry;
        user.lastOtpSentAt = lastOtpSentAt;
        await user.save();
        await sendVerificationEmail(email, newOtp);

        return res.status(400).json({
          success: false,
          message: "OTP expired. A new OTP has been sent to your email.",
        });
      } catch (emailError) {
        console.error("Failed to resend OTP:", emailError);
        return res.status(500).json({
          success: false,
          message: "Failed to resend OTP. Please try signup again.",
        });
      }
    }

    const inputHash = crypto
      .createHmac("sha256", process.env.SECRET)
      .update(otp)
      .digest("hex");

    if (inputHash !== user.hashedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.hashedOtp = null;
    user.otpExpiry = null;
    user.lastOtpSentAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully, Please login",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not registered, please signup first",
      });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Please verify your email first" });
    }

    if (user.googleId && !user.password) {
      return res.status(403).json({
        success: false,
        message:
          "This account is linked to Google. Please login with Google instead.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid account state. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.password = undefined;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// Refresh
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (jwtError) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

// logout
export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
