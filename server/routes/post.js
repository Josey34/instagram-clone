import express from "express";
import { createComment, getPostComments } from "../controllers/commentController.js";
import { createPost, deletePost, getExplorePosts, getFeed, getPostById, getSavedPosts, getUserPosts, searchPostsByHashtag, toggleLike, toggleSavePost } from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.get('/feed', protect, getFeed);
router.get('/explore', protect, getExplorePosts);
router.get('/saved', protect, getSavedPosts);
router.post('/create', protect, createPost);

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.get('/user/:id', getUserPosts);
router.get('/search/hashtag', searchPostsByHashtag);

// ============================================
// ROUTES WITH :id PARAMETER (Must be last)
// ============================================
router.get('/:id/comments', getPostComments);
router.get('/:id', getPostById);
router.post('/:id/comments', protect, createComment);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSavePost);
router.delete('/:id', protect, deletePost);

export default router;