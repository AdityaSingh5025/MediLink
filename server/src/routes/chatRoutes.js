import express from 'express'
import { authMiddleware} from '../middleware/authmiddleware.js';
import { getChatHistory ,getUserChats} from '../controllers/chat/chatController.js';

const router = express.Router();

// addd auth ,owner middleware 
// /chat/:listingId
router.get("/my-chats", authMiddleware, getUserChats);
router.get('/:listingId',authMiddleware,getChatHistory)

export default router;