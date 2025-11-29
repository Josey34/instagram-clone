import express from "express";
import { body } from "express-validator";
import { createLimiter } from "../config/rateLimiter.js";
import { createStory, deleteStory, getFollowingStories, getUserStories, viewStory } from "../controllers/storyController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.post('/create', protect, createLimiter, [
    body('image').trim().notEmpty().withMessage('Image URL is required')
], validate, createStory);

router.get('/following', protect, getFollowingStories);
router.get('/user/:id', protect, getUserStories);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

export default router;