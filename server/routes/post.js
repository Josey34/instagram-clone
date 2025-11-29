import express from "express";
import { body } from 'express-validator';
import { createLimiter } from "../config/rateLimiter.js";
import { createComment, getPostComments } from "../controllers/commentController.js";
import { createPost, deletePost, getExplorePosts, getFeed, getPostById, getSavedPosts, getUserPosts, searchPostsByHashtag, toggleLike, toggleSavePost } from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import upload from '../middleware/upload.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.get('/feed', protect, getFeed);
router.get('/explore', protect, getExplorePosts);
router.get('/saved', protect, getSavedPosts);

router.post('/create', protect, createLimiter, upload.single('image'), [
    body('caption').optional().trim().isLength({ max: 2200 }).withMessage('Caption must not exceed 2200 characters')
], validate, createPost);

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

router.post('/:id/comments', protect, [
    body('text').trim().notEmpty().withMessage('Comment text is required')
        .isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
], validate, createComment);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSavePost);
router.delete('/:id', protect, deletePost);

export default router;