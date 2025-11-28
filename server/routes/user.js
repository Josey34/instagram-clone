import express from "express";

import { body } from "express-validator";
import { getLoggedInUser, getUserByUsername, toggleFollow, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get('/me', protect, getLoggedInUser);
router.put('/profile', protect, [
    body('bio').optional().trim().isLength({ max: 200 }).withMessage('Bio must be at most 200 characters long'),
    body('profilePicture').optional().trim().isURL().withMessage('Profile picture must be a valid URL')
], updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:username', getUserByUsername);

export default router;