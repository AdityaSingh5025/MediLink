import express from "express";
import { authMiddleware, isUser } from '../middleware/authMiddleware.js';
import { 
  getLeaderboard,
  getUserStats,
  getUserRankById
} from "../controllers/leaderBoard/leaderboardController.js";

const router = express.Router();


router.get("/", getLeaderboard);                          
router.get("/user/:userId", getUserRankById);             

router.get("/my-rank", authMiddleware, isUser, getUserStats);  

export default router;