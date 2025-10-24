// Generate both tokens
import jwt from 'jsonwebtoken'
export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, accountType: user.accountType, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
