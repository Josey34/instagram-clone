import express from "express";
import { createComment, getPostComments } from "../controllers/commentController.js";
import { createPost, deletePost, getPostById, getUserPosts, toggleLike } from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.get('/user/:id', getUserPosts);
router.get('/:id/comments', getPostComments);
router.get('/:id', getPostById);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.post('/create', protect, createPost);
router.post('/:id/comments', protect, createComment);
router.post('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);
export default router;