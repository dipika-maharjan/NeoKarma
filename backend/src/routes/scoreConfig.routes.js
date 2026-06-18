/**
 * Score Configuration Routes
 */
const express = require('express');
const scoreConfigController = require('../controllers/scoreConfig.controller');

const router = express.Router();

/**
 * GET /score-config
 * Get all score calculation configuration values
 */
router.get('/', scoreConfigController.getScoreConfig);

module.exports = router;
