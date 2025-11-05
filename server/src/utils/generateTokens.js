import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  try {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("JWT secrets not configured");
    }

    if (!user || !user._id) {
      throw new Error("Invalid user object for token generation");
    }

    const userId = user._id.toString();
    const userAccountType = user.accountType || "user";
    const userName = user.name || "Unknown";

    const accessToken = jwt.sign(
      {
        id: userId,
        accountType: userAccountType,
        name: userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new Error(`Failed to generate tokens: ${error.message}`);
  }
};
