/**
 * Mitigation Plan Routes
 */
const express = require('express');
const mitigationPlanController = require('../controllers/mitigationPlan.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All mitigation plan routes require authentication
router.use(authMiddleware);

/**
 * GET /api/mitigation-plan
 */
router.get('/', mitigationPlanController.getActivePlan);

/**
 * POST /api/mitigation-plan/generate
 */
router.post('/generate', mitigationPlanController.generatePlan);

/**
 * GET /api/mitigation-plan/history
 */
router.get('/history', mitigationPlanController.getHistory);

module.exports = router;
