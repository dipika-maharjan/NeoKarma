const aiMitigationService = require('../services/aiMitigation.service');

class MitigationController {
  /**
   * Handles POST /api/carbon/mitigation/generate
   * Compiles historical 30-day benchmarks to construct the personalized 1-Month Plan roadmap
   */
  async generatePlan(req, res, next) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Student userId token identifier is mandatory to generate a plan.'
        });
      }

      const freshPlan = await aiMitigationService.generateOneMonthPlan(userId);

      return res.status(201).json({
        success: true,
        message: 'Personalized AI 1-Month Mitigation Plan successfully computed.',
        data: freshPlan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles GET /api/carbon/mitigation/active/:userId
   * Retrieves the student's current active action checklist
   */
  async getActivePlan(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Student parameters missing userId URL parameters.'
        });
      }

      const currentPlan = await aiMitigationService.getActivePlan(userId);

      return res.status(200).json({
        success: true,
        data: currentPlan
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MitigationController();