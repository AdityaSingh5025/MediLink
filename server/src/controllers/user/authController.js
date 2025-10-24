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

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
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

        const { otp, hashedOtp, otpExpiry, lastOtpSentAt } = await generateOtp(
          email
        );

        existingUser.otpExpiry = otpExpiry;
        existingUser.hashedOtp = hashedOtp;
        existingUser.lastOtpSentAt = lastOtpSentAt;
        await existingUser.save();

        await sendVerificationEmail(email, otp);

        return res.status(200).json({
          success: true,
          // redirect to verification mail page
          message: "user already signed up,Verification mail send successfully",
        });
      }
      return res.status(400).json({
        success: false,
        message: "user already registered please login",
      });
    }

    // generate otp and  send mail
    const { otp, hashedOtp, otpExpiry, lastOtpSentAt } = await generateOtp(
      email
    );

    // hashpassword
    const hashedPassword = await bcrypt.hash(password, 8);
    // create new user
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
      message: "user created successfully , please verify your email",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// verify otp
export const verifyEmail = async (req, res) => {
  try {
    // email will come from fontend signup flow
    const { email, otp } = req.body;

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "please enter otp" });
    }

    const user = await User.findOne({ email });

    if (user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "Already verified" });

    if (!user || !user.hashedOtp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found, please request again",
      });
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      const { otp, hashedOtp, otpExpiry, lastOtpSentAt } =await generateOtp(email);
      // Update user with new hashed OTP and metadata
      user.hashedOtp = hashedOtp;
      user.otpExpiry = otpExpiry;
      user.lastOtpSentAt = lastOtpSentAt;
      await user.save();
      await sendVerificationEmail(email, otp);
      return res.status(400).json({
        success: false,
        message:
          "OTP expired. A new OTP has been sent to your email. Please check and try again.",
      });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    if (user?.googleId != null && !user.password) {
      return res.status(403).json({
        success: false,
        message:
          "This account is linked to Google. Please login with Google instead.",
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
      sameSite: "strict",
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
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Refresh
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

// logout
export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ success: true, message: "Logged out" });
};
