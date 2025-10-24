import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Authentication Middleware
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
      accountType: decoded.accountType,
    };
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong in auth middleware",
      error: error.message,
    });
  }
};

// Allows access only if the authenticated user has an admin role
export const isAdminMiddleware = async (req, res, next) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Permission denied. This route is for Admin only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong in auth middleware",
      error: error.message,
    });
  }
};

export const isUser = async (req, res, next) => {
  try {
    // Check the user's role
    if (req.user.accountType !== "user") {
      return res.status(401).json({
        success: false,
        message: "Permission denied. This route is for regular users only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong in auth middleware",
      error: error.message,
    });
  }
};

export const isSeller = async (req, res, next) => {
  try {
    if (req.user.accountType !== "seller") {
      return res.status(401).json({
        success: false,
        message: "Permission denied. This route is for  seller only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong in auth middleware",
      error: error.message,
    });
  }
};
