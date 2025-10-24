import express from 'express'
const router = express.Router();
import { createProfile , getUserDetails} from '../controllers/user/profileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.post('/saveprofile',authMiddleware,createProfile)
router.get('/getuserdetails',authMiddleware,getUserDetails)

export default router;