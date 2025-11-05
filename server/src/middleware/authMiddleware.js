import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Extract token from Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not found. Please log in.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
      });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name || "Anonymous",
      accountType: decoded.accountType || "user",
    };

    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user found",
      });
    }

    if (req.user.accountType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("isAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

export const isUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user found",
      });
    }
    const allowedRoles = ["user", "seller", "admin"];

    if (!allowedRoles.includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Invalid account type",
      });
    }

    next();
  } catch (error) {
    console.error("isUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

export const isSeller = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user found",
      });
    }

    if (req.user.accountType !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Access denied - Seller privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("isSeller error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};
