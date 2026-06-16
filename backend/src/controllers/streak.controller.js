/**
 * Streak Controller
 * Handles streak and participation score endpoints
 */
const streakService = require('../services/streak.service');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

class StreakController {
  /**
   * GET /api/streak
   * Get current streak and participation score (auth required)
   */
  getStreak = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const streak = await streakService.getStreak(userId);
    if (!streak) {
      throw new AppError('Streak data not found', 404);
    }

    res.status(200).json({
      success: true,
      data: streak
    });
  });
}

module.exports = new StreakController();
