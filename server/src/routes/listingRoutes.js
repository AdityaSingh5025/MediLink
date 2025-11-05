import express from 'express'
import {createListing,getAllListings,getListing,updateListingStatus,deleteListing, updateListing, getMyListings} from '../controllers/listing/listingController.js'
import { authMiddleware, isUser } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/create-listing',authMiddleware,isUser,createListing)
router.get('/get-all-listing',getAllListings)
router.get('/get-listing/:id',authMiddleware,getListing)
router.get("/mylisting", authMiddleware, getMyListings);
router.patch('/update-listing-status/:id',authMiddleware,updateListingStatus)
router.put('/update-listing/:id',authMiddleware,isUser,updateListing)
router.delete('/delete-listing/:id',authMiddleware,isUser,deleteListing)

export default router;