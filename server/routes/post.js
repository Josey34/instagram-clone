import express from "express";
import { createComment, getPostComments } from "../controllers/commentController.js";
import { createPost, deletePost, getExplorePosts, getFeed, getPostById, getSavedPosts, getUserPosts, searchPostsByHashtag, toggleLike, toggleSavePost } from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.get('/user/:id', getUserPosts);
router.get('/:id/comments', getPostComments);
router.get('/search/hashtag', searchPostsByHashtag);
router.get('/:id', getPostById);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.get('/feed', protect, getFeed);
router.post('/create', protect, createPost);
router.get('/explore', protect, getExplorePosts);
router.get('/saved', protect, getSavedPosts);
router.post('/:id/comments', protect, createComment);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSavePost);
router.delete('/:id', protect, deletePost);

export default router;