import express from 'express'
const router = express.Router()

import { authMiddleware, isUser } from '../middleware/authMiddleware.js';
import {
  approveRequest,
  cancelRequest,
  completeRequest,
  createRequest,
  getMyrequest,
  getRequestForListing,
  rejectRequest,
  markAsDonated
} from '../controllers/request/RequestController.js';

router.post('/create-request/:listingId', authMiddleware, isUser, createRequest);
router.get('/getrequest-my', authMiddleware, isUser, getMyrequest);
router.get('/listing/:listingId', authMiddleware, isUser, getRequestForListing);
router.put('/:requestId/approve', authMiddleware, isUser, approveRequest);
router.put('/:requestId/cancel', authMiddleware, isUser, cancelRequest);
router.put('/:requestId/reject', authMiddleware, isUser, rejectRequest);
router.put('/:requestId/complete', authMiddleware, isUser, completeRequest);
router.put('/:requestId/mark-donated', authMiddleware, isUser, markAsDonated);

export default router;
