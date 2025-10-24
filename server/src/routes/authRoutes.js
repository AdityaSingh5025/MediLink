import express from 'express'
import { signup, verifyEmail, login, logout,refreshToken} from '../controllers/user/authController.js';

const router = express.Router();

router.post('/signup',signup);
router.post('/verify-email',verifyEmail);
router.post('/login',login);
router.post("/refresh", refreshToken);
router.post('/logout',logout);

export default router;