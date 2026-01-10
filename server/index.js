import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./src/config/dbConnect.js";
import authRoutes from "./src/routes/authRoutes.js";
import listingRoutes from "./src/routes/listingRoutes.js";
import requestRoutes from "./src/routes/requestRoute.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import leaderBoardRoutes from "./src/routes/leaderBoardRoute.js";
import cloudinary from "./src/config/cloudinary.js";
import Chat from "./src/models/Chat.js";
import User from "./src/models/User.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

await connectDB();
cloudinary();

app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1); // Enable trust proxy for secure cookies behind Vercel/Zeabur proxies

const allowedOrigins = process.env.FRONTEND_URLS?.split(",") || [
  "http://localhost:5173",
  "http://localhost:3000"
];


app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return cb(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // Allow any *.vercel.app domain (for preview deployments)
      if (origin && origin.match(/^https:\/\/.*\.vercel\.app$/)) {
        return cb(null, true);
      }

      // Allow any localhost in development
      if (process.env.NODE_ENV === "development" && origin && origin.startsWith("http://localhost:")) {
        return cb(null, true);
      }

      console.log(" CORS blocked origin:", origin);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listing", listingRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/leaderboard", leaderBoardRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({
  ok: true,
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
}));

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (origin && origin.match(/^https:\/\/.*\.vercel\.app$/)) {
        return cb(null, true);
      }
      // console.log("Socket CORS blocked origin:", origin);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("Socket connection rejected: No token");
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details
    const user = await User.findById(decoded.id).select('name email avatar');

    if (!user) {
      // console.log("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }

    socket.user = {
      id: decoded.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };

    // console.log("Socket authenticated:", user.name);
    next();
  } catch (err) {
    console.error("Socket auth failed:", err.message);
    next(new Error(err.message.includes('jwt') ? 'Invalid or expired token' : 'Authentication failed'));
  }
});

// Track online users
const onlineUsers = new Map();

// Socket Event Handlers
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.user.name} (${socket.id})`);

  // Track user online status
  if (!onlineUsers.has(socket.user.id)) {
    onlineUsers.set(socket.user.id, new Set());
  }
  onlineUsers.get(socket.user.id).add(socket.id);

  // Join Room
  socket.on("joinRoom", async ({ listingId, userId, userName }) => {
    try {
      // console.log(`${userName || socket.user.name} attempting to join room: ${listingId}`);

      const chat = await Chat.findOne({ listingId });

      if (!chat) {
        // console.log(`Chat not found for listing: ${listingId}`);
        return socket.emit("error", { message: "Chat not found" });
      }

      if (!chat.participants.includes(socket.user.id)) {
        // console.log(`User ${socket.user.id} not authorized for chat ${chat._id}`);
        return socket.emit("error", { message: "Access denied to this chat" });
      }

      socket.join(listingId);
      console.log(`${socket.user.name} joined room: ${listingId}`);

      // Notify user of successful join
      socket.emit("joinSuccess", {
        listingId,
        chatId: chat._id,
        participants: chat.participants
      });

      // Notify others in the room
      socket.to(listingId).emit("userJoined", {
        userId: socket.user.id,
        userName: socket.user.name,
        timestamp: new Date(),
      });
    } catch (error) {
      // console.error("joinRoom error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Send Message
  socket.on("sendMessage", async ({ listingId, text, senderId, senderName }, callback) => {
    try {
      // console.log(`Message from ${socket.user.name} to room ${listingId}`);

      // Validate input
      if (!text || typeof text !== "string" || !text.trim()) {
        const error = { error: "Invalid message text" };
        if (callback) callback(error);
        return socket.emit("error", error);
      }

      if (!listingId) {
        const error = { error: "Listing ID required" };
        if (callback) callback(error);
        return socket.emit("error", error);
      }

      // Find chat
      const chat = await Chat.findOne({ listingId });

      if (!chat) {
        const error = { error: "Chat not found" };
        if (callback) callback(error);
        return socket.emit("error", error);
      }

      if (!chat.participants.includes(socket.user.id)) {
        const error = { error: "Not authorized to send messages" };
        if (callback) callback(error);
        return socket.emit("error", error);
      }

      // Sanitize and trim message
      const cleanText = text
        .replace(/<[^>]*>?/gm, "") // Remove HTML tags
        .trim()
        .substring(0, 1000); // Limit length

      // Create message object
      const messageData = {
        senderId: socket.user.id,
        text: cleanText,
        timestamp: new Date(),
      };

      // Save to database
      chat.messages.push(messageData);
      chat.lastActivity = new Date();
      await chat.save();

      // Get the saved message with _id
      const savedMessage = chat.messages[chat.messages.length - 1];

      // Prepare message for broadcast
      const messageToSend = {
        _id: savedMessage._id.toString(),
        senderId: socket.user.id,
        senderName: socket.user.name,
        text: cleanText,
        timestamp: savedMessage.timestamp,
      };


      // Broadcast to all users in the room (including sender)
      io.to(listingId).emit("receiveMessage", messageToSend);

      // Send success callback
      if (callback) {
        callback({
          success: true,
          message: messageToSend
        });
      }
    } catch (error) {
      console.error("sendMessage error:", error);
      const errorResponse = { error: "Failed to send message" };

      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit("error", errorResponse);
      }
    }
  });

  // Typing Indicator
  socket.on("typing", ({ listingId, userId, userName }) => {
    try {
      // console.log(`${userName || socket.user.name} is typing in ${listingId}`);

      socket.to(listingId).emit("userTyping", {
        userId: socket.user.id,
        userName: socket.user.name,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("typing error:", error);
    }
  });

  // Stop Typing Indicator
  socket.on("stopTyping", ({ listingId, userId }) => {
    try {
      socket.to(listingId).emit("userStoppedTyping", {
        userId: socket.user.id,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("stopTyping error:", error);
    }
  });

  // Leave Room
  socket.on("leaveRoom", ({ listingId }) => {
    try {
      socket.leave(listingId);
      // console.log(`${socket.user.name} left room: ${listingId}`);

      socket.to(listingId).emit("userLeft", {
        userId: socket.user.id,
        userName: socket.user.name,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("leaveRoom error:", error);
    }
  });

  // Disconnect
  socket.on("disconnect", (reason) => {
    try {
      // console.log(`${socket.user.name} disconnected: ${reason}`);

      // Remove from online users
      const userSockets = onlineUsers.get(socket.user.id);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.user.id);
          // console.log(`${socket.user.name} is now offline`);
        }
      }
    } catch (error) {
      console.error("disconnect error:", error);
    }
  });

  // Error handler
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.user.name}:`, error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  // Log but don't exit in production
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  console.error(err.stack);

  // Only exit for fatal errors
  if (err.fatal) {
    console.error("Fatal error detected, shutting down...");
    process.exit(1);
  }
});


const PORT = process.env.PORT;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});

export { io }; 