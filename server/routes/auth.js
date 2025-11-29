import express from "express";
import { body } from "express-validator";

import { authLimiter } from "../config/rateLimiter.js";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.post('/register', authLimiter, [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address')
], registerUser);

router.post('/login', authLimiter,[
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], loginUser);

// router.post('/posts', protect, createPost); // Only logged-in users can create posts
// router.get('/profile', protect, getMyProfile); // Only logged-in users can view their profile

export default router;