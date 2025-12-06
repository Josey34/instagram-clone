import express from 'express';
import { getHealthStatus, getLiveness, getReadiness } from '../controllers/healthController.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Full health check with database and system info
 * @access  Public
 */
router.get('/', getHealthStatus);

/**
 * @route   GET /api/health/liveness
 * @desc    Liveness probe - is the server running?
 * @access  Public
 */
router.get('/liveness', getLiveness);

/**
 * @route   GET /api/health/readiness
 * @desc    Readiness probe - is the server ready to handle requests?
 * @access  Public
 */
router.get('/readiness', getReadiness);

export default router;