/**
 * Daily Log Routes
 */
const express = require('express');
const dailyLogController = require('../controllers/dailyLog.controller');
const { submitLogValidator } = require('../validators/dailyLog.validator');
const validateMiddleware = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All daily log routes require authentication
router.use(authMiddleware);

/**
 * POST /api/daily-log
 */
router.post('/', submitLogValidator, validateMiddleware, dailyLogController.submitLog);

/**
 * GET /api/daily-log/today
 */
router.get('/today', dailyLogController.checkTodayLog);

/**
 * GET /api/daily-log/history
 */
router.get('/history', dailyLogController.getHistory);

module.exports = router;
