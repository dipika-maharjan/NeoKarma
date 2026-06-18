/**
 * Application configuration controller
 * Returns non-sensitive app-level settings for frontend use.
 */
const config = require('../config/env');

class ConfigController {
  getConfig = async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        kgCo2PerTreePerYear: config.KG_CO2_PER_TREE_PER_YEAR,
        dailyTreeAbsorptionKg: config.DAILY_TREE_ABSORPTION_KG,
        impactScoreGoal: config.IMPACT_SCORE_GOAL,
        frontendOrigin: config.FRONTEND_ORIGIN
      }
    });
  };
}

module.exports = new ConfigController();
