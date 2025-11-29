import express from "express";
import { createPost, deletePost, getPostById, getUserPosts, toggleLike } from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.get('/user/:id', getUserPosts);
router.get('/:id', getPostById);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.post('/create', protect, createPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

export default router;