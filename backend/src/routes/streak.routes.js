/**
 * Streak Routes
 */
const express = require('express');
const streakController = require('../controllers/streak.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All streak routes require authentication
router.use(authMiddleware);

/**
 * GET /api/streak
 */
router.get('/', streakController.getStreak);

module.exports = router;
