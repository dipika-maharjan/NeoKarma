const express = require('express');
const router = express.Router();

// Controller Import
const gradingController = require('../controllers/grading.controller');

/**
 * FEATURE 4: Daily Streak & School Grade Integration
 * GET /api/grading/status/:userId
 * Evaluates logging compliance patterns over a 30-day window for practical marks allocation[cite: 1, 2]
 */
router.get('/status/:userId', gradingController.getStudentGradeMetrics);

module.exports = router;