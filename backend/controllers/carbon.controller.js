const carbonService = require('../services/carbon.service');

class CarbonController {
  /**
   * Handles POST /api/carbon/log
   * Submits daily student activities and receives calculated data + Carbon Mirror metrics
   */
  async logDailyActivity(req, res, next) {
    try {
      const { userId, inputs } = req.body;

      // Primary check ensuring required payloads are structural
      if (!userId || !inputs) {
        return res.status(400).json({
          success: false,
          message: 'Malformed payload request. Missing userId or input attributes.'
        });
      }

      // Pass directly down to the business service layer
      const computationResult = await carbonService.processDailyLog(userId, inputs);

      return res.status(200).json({
        success: true,
        message: 'Daily carbon logs recorded and evaluated successfully.',
        data: computationResult
      });
    } catch (error) {
      // Passes any unexpected system error straight into your global error handler middleware
      next(error);
    }
  }
}

module.exports = new CarbonController();