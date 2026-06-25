/**
 * Score Configuration Controller
 * Exposes score calculation weights and thresholds to frontend
 */
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

class ScoreConfigController {
  /**
   * GET /api/score-config
   * Return all hardcoded score calculation values
   */
  getScoreConfig = asyncHandler(async (req, res) => {
    const scoreConfig = {
      // Streak Points Calculation
      streakMultiplier: process.env.SCORE_STREAK_MULTIPLIER ? parseFloat(process.env.SCORE_STREAK_MULTIPLIER) : 5,
      streakMaxPoints: process.env.SCORE_STREAK_MAX_POINTS ? parseInt(process.env.SCORE_STREAK_MAX_POINTS, 10) : 25,

      // Consistency Points Calculation
      consistencyMultiplier: process.env.SCORE_CONSISTENCY_MULTIPLIER ? parseFloat(process.env.SCORE_CONSISTENCY_MULTIPLIER) : 2.5,
      consistencyMaxPoints: process.env.SCORE_CONSISTENCY_MAX_POINTS ? parseInt(process.env.SCORE_CONSISTENCY_MAX_POINTS, 10) : 25,

      // Actions Points Calculation
      actionsWeight: process.env.SCORE_ACTIONS_WEIGHT ? parseInt(process.env.SCORE_ACTIONS_WEIGHT, 10) : 35,
      actionsDefaultPoints: process.env.SCORE_ACTIONS_DEFAULT_POINTS ? parseInt(process.env.SCORE_ACTIONS_DEFAULT_POINTS, 10) : 0,

      // Completeness Points Calculation
      completenessThreshold: process.env.SCORE_COMPLETENESS_THRESHOLD ? parseInt(process.env.SCORE_COMPLETENESS_THRESHOLD, 10) : 3,
      completenessHighPoints: process.env.SCORE_COMPLETENESS_HIGH_POINTS ? parseInt(process.env.SCORE_COMPLETENESS_HIGH_POINTS, 10) : 15,
      completenessLowMultiplier: process.env.SCORE_COMPLETENESS_LOW_MULTIPLIER ? parseFloat(process.env.SCORE_COMPLETENESS_LOW_MULTIPLIER) : 5,
      completenessLowMaxPoints: process.env.SCORE_COMPLETENESS_LOW_MAX_POINTS ? parseInt(process.env.SCORE_COMPLETENESS_LOW_MAX_POINTS, 10) : 15,

      // Overall Score
      overallMaxScore: process.env.SCORE_OVERALL_MAX ? parseInt(process.env.SCORE_OVERALL_MAX, 10) : 100,

      // Impact Drop (for Score History view)
      impactDropDefault: process.env.SCORE_IMPACT_DROP_DEFAULT ? parseInt(process.env.SCORE_IMPACT_DROP_DEFAULT, 10) : 17,

      // Status Thresholds (for Dashboard)
      goldThreshold: process.env.SCORE_GOLD_THRESHOLD ? parseInt(process.env.SCORE_GOLD_THRESHOLD, 10) : 800,
      silverThreshold: process.env.SCORE_SILVER_THRESHOLD ? parseInt(process.env.SCORE_SILVER_THRESHOLD, 10) : 600,

      // PDF Points per log
      pdfPointsPerLog: process.env.SCORE_PDF_POINTS_PER_LOG ? parseInt(process.env.SCORE_PDF_POINTS_PER_LOG, 10) : 10
    };

    res.status(200).json({
      success: true,
      data: scoreConfig
    });
  });
}

module.exports = new ScoreConfigController();
