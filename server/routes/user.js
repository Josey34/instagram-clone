import express from "express";

import { getLoggedInUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get('/me', protect, getLoggedInUser);

export default router;