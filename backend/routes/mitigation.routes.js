const express = require('express');
const router = express.Router();

// Ensure this path back to controllers is correct (two dots)
const mitigationController = require('../controllers/mitigation.controller');

/**
 * FEATURE 3: AI-Powered Action Plans
 */
router.post('/generate', mitigationController.generatePlan);
router.get('/active/:userId', mitigationController.getActivePlan);

module.exports = router;