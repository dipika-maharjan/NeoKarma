const gradingService = require('../services/grading.service');

class GradingController {
  /**
   * Handles GET /api/carbon/grading/status/:userId
   * Compiles habit streak compliance to generate school-ready practical evaluations
   */
  async getStudentGradeMetrics(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Request parameter missing user identification ID.'
        });
      }

      const gradingAnalysis = await gradingService.evaluatePracticalMarks(userId);

      return res.status(200).json({
        success: true,
        message: 'Student baseline grading compliance metrics fetched successfully.',
        data: gradingAnalysis
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GradingController();