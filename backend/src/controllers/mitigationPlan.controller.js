/**
 * Mitigation Plan Controller
 * Handles mitigation plan generation and retrieval
 */
const mitigationPlanService = require('../services/mitigationPlan.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

class MitigationPlanController {
  /**
   * GET /api/mitigation-plan
   * Get current active plan (auth required)
   */
  getActivePlan = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const plan = await mitigationPlanService.getActivePlan(userId);
    if (!plan) {
      return res.status(200).json({
        success: true,
        message: 'No active plan yet. Log consistently to generate one.',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  });

  /**
   * POST /api/mitigation-plan/generate
   * Manually trigger plan generation (for demo/testing)
   */
  generatePlan = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const plan = await mitigationPlanService.generatePlanForUser(userId);

    res.status(201).json({
      success: true,
      message: 'Mitigation plan generated successfully',
      data: plan
    });
  });

  /**
   * GET /api/mitigation-plan/history
   * Get all plans for a user (including inactive)
   */
  getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const plans = await mitigationPlanService.getUserPlans(userId);

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  });
}

module.exports = new MitigationPlanController();
