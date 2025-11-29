import express from "express";
import { deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.delete('/:id', protect, deleteComment);

export default router;