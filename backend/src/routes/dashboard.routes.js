/**
 * Dashboard Routes
 */
const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(authMiddleware);

/**
 * GET /api/dashboard/summary
 */
router.get('/summary', dashboardController.getSummary);

module.exports = router;
