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

dotenv.config();




const app = express();
const server = http.createServer(app);

await connectDB();
cloudinary();

app.use(cookieParser());
app.use(express.json());


const allowedOrigins = process.env.FRONTEND_URLS?.split(",") || [];

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
      
      console.log(' CORS blocked origin:', origin);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);





app.use("/api/auth", authRoutes);
app.use("/api/profile",profileRoutes );
app.use("/api/user",userRoutes );
app.use("/api/listing", listingRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/leaderboard", leaderBoardRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));


// Update Socket.io CORS too
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (origin && origin.match(/^https:\/\/.*\.vercel\.app$/)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});


io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No authentication token found"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("Socket auth failed:", err.message);
    next(new Error("Unauthorized"));
  }
});

// Socket Events
io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ listingId }) => {
    const chat = await Chat.findOne({ listingId });
    if (!chat || !chat.participants.includes(socket.user.id))
      return socket.emit("error", { message: "Access denied to chat" });

    socket.join(listingId);
    socket.emit("joinSuccess", { listingId, chatId: chat._id });
  });

  socket.on("sendMessage", async ({ listingId, text }) => {
    const chat = await Chat.findOne({ listingId });
    if (!chat || !chat.participants.includes(socket.user.id))
      return socket.emit("error", { message: "Not authorized" });

    const cleanText = text.replace(/<[^>]*>?/gm, "").substring(0, 1000);
    const message = {
      senderId: socket.user.id,
      text: cleanText,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    io.to(listingId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.user?.id);
  });
});


const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(` Server & Socket running on port ${PORT}`);
// });

// Bind to 0.0.0.0 for 
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server & Socket running on port ${PORT}`);
});
