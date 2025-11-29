import express from 'express';
import { deleteImage, uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload single image
// Use query param ?type=posts or ?type=stories or ?type=profile
router.post('/', protect, upload.single('image'), uploadImage);

// Delete image
router.delete('/', protect, deleteImage);

export default router;