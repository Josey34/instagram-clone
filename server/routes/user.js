import express from "express";
import { body } from "express-validator";
import { deleteProfile, getFollowers, getFollowing, getLoggedInUser, getUserByUsername, searchUsers, toggleFollow, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { validate } from '../middleware/validation.js';

const router = express.Router();

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.get('/me', protect, getLoggedInUser);

router.put('/me', protect, upload.single('profilePicture'), [
    body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('fullName').optional().trim().isLength({ min: 1, max: 50 }),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio must not exceed 150 characters')
], validate, updateProfile);

router.delete('/me', protect, deleteProfile);
router.post('/:id/follow', protect, toggleFollow);

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/search', searchUsers);
router.get('/:username', getUserByUsername);

export default router;