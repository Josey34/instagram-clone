import express from "express";
import { body } from "express-validator";
import { authLimiter } from "../config/rateLimiter.js";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../controllers/authController.js";
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', authLimiter, [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('fullname').trim().isLength({ min: 1, max: 50}),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], validate, registerUser);

router.post('/login', authLimiter, [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], validate, loginUser);

router.post('/forgot-password', authLimiter, [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], validate, forgotPassword);

router.post('/reset-password/:token', authLimiter, [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], validate, resetPassword);

export default router;