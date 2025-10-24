import crypto from "crypto";

export const generateOtp = async (email) => {
  try {
    const otp = crypto.randomInt(100000, 1000000).toString();

    // hashOtp
    const hashedOtp = crypto
      .createHmac("sha256", process.env.SECRET)
      .update(otp)
      .digest("hex");

    const expires = Date.now() + 2 * 60 * 1000; // 10 minutes in

    return {
      hashedOtp: hashedOtp,
      otp,
      otpExpiry: new Date(expires),
      lastOtpSentAt: new Date(),
    };
  } catch (error) {
    throw error;
  }
};

