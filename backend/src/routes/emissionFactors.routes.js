/**
 * Emission Factors Routes
 * Read-only endpoint for transparency and debugging
 */
const express = require('express');
const emissionCalculationService = require('../services/emissionCalculation.service');
const authMiddleware = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// All emission factor routes require authentication
router.use(authMiddleware);

/**
 * GET /api/emission-factors
 * Get all active emission factors (for debugging and transparency)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const factors = await emissionCalculationService.getAllFactors();
    res.status(200).json({
      success: true,
      count: factors.length,
      data: factors
    });
  })
);

module.exports = router;
