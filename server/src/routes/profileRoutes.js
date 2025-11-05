import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  createProfile, 
  getUserDetails,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/user/profileController.js';

const router = express.Router();

// Profile management
router.post('/saveprofile', authMiddleware, createProfile);
router.get('/getuserdetails', authMiddleware, getUserDetails);

// Address management
router.post('/address', authMiddleware, addAddress);
router.put('/address/:addressId', authMiddleware, updateAddress);
router.delete('/address/:addressId', authMiddleware, deleteAddress);

export default router;