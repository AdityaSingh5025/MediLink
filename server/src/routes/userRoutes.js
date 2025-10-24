import express from 'express'
import { authMiddleware} from '../middleware/authMiddleware.js'
import { updateUserInfo, updatePassword, forgotPassword, resetPassword, deleteAccount } from '../controllers/user/userController.js'


const router = express.Router()
 
router.put('/update-user-info',authMiddleware,updateUserInfo)
router.put('/update-password',authMiddleware,updatePassword)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)
router.delete('/delete-account',authMiddleware,deleteAccount)

export default router