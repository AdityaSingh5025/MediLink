import express from 'express'
import { authMiddleware} from '../middleware/authMiddleware.js';
import { getChatHistory ,getUserChats} from '../controllers/chat/chatController.js';

const router = express.Router();


router.get("/my-chats", authMiddleware, getUserChats);
router.get('/:listingId',authMiddleware,getChatHistory)

export default router;