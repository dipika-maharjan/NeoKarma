const express = require('express');
const router = express.Router();

// Controller Import
const carbonController = require('../controllers/carbon.controller');

// Middleware Import
const { validateDailyLog } = require('../middlewares/validator.middleware');

/**
 * FEATURES 1 & 2: Daily Calculator & Carbon Mirror
 * POST /api/calculator/log
 * Guarded by validation middleware to verify student metrics under 60 seconds
 */
router.post('/log', validateDailyLog, carbonController.logDailyActivity);

module.exports = router;