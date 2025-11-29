import express from "express";
import { createStory, deleteStory, getFollowingStories, getUserStories, viewStory } from "../controllers/storyController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.post('/create', protect, createStory);
router.get('/following', protect, getFollowingStories);
router.get('/user/:id', protect, getUserStories);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

export default router;