/**
 * Daily Log Controller
 * Handles daily activity logging and history retrieval
 */
const dailyLogRepository = require('../repositories/dailyLog.repository');
const emissionCalculationService = require('../services/emissionCalculation.service');
const streakService = require('../services/streak.service');
const carbonMirrorService = require('../services/carbonMirror.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getTodayStr } = require('../utils/dateHelpers');

class DailyLogController {
  submitLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const {
      transportationMode,
      transportationDistanceKm,
      foodMealType,
      wasteAndPlasticCount,
      energyUsageHours,
      energyFirewoodKg,
      extraAnswer
    } = req.body;

    // Validation
    if (
      !transportationMode ||
      transportationDistanceKm === undefined ||
      !foodMealType ||
      wasteAndPlasticCount === undefined ||
      energyUsageHours === undefined
    ) {
      throw new AppError('Missing required fields for daily log', 400);
    }

    const today = getTodayStr();

    // Check if user has already logged today
    const existingLog = await dailyLogRepository.findByUserAndDate(userId, today);
    if (existingLog) {
      throw new AppError("You have already logged today's emissions", 400);
    }

    // Calculate emissions using service
    const emissionResult = await emissionCalculationService.calculateEmissions({
      transportationMode,
      transportationDistanceKm,
      foodMealType,
      wasteAndPlasticCount,
      energyUsageHours,
      energyFirewoodKg: energyFirewoodKg || 0
    });

    // Create log
    const createdLog = await dailyLogRepository.create({
      userId,
      date: today,
      transportation: { mode: transportationMode, distanceKm: transportationDistanceKm },
      food: { mealType: foodMealType },
      wasteAndPlastic: { plasticItemCount: wasteAndPlasticCount },
      energy: { usageHours: energyUsageHours, firewoodKg: energyFirewoodKg || 0 },
      extraAnswer: extraAnswer || null,
      breakdown: emissionResult.breakdown,
      totalEmissionKg: emissionResult.totalEmissionKg
    });

    // Update streak
    const updatedUser = await streakService.updateStreakAfterLogCreation(userId);

    // Update monthly snapshot
    await carbonMirrorService.updateSnapshotAfterLog(userId, today, emissionResult);

    // Generate Carbon Mirror
    const mirror = await carbonMirrorService.generateMirror(createdLog.totalEmissionKg);

    res.status(201).json({
      success: true,
      message: 'Daily log submitted successfully',
      data: {
        log: createdLog,
        mirror,
        updatedStreak: updatedUser.streak
      }
    });
  });

  /**
   * GET /api/daily-log/today
   * Check if user has already logged today
   */
  checkTodayLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const today = getTodayStr();

    const log = await dailyLogRepository.findByUserAndDate(userId, today);

    res.status(200).json({
      success: true,
      hasLoggedToday: !!log,
      data: log || null
    });
  });

  /**
   * GET /api/daily-log/history
   * Get logs within a date range (?from=&to=)
   */
  getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { from, to } = req.query;

    // Default: last 30 days
    let logs;
    if (from && to) {
      logs = await dailyLogRepository.getLogsByDateRange(userId, from, to);
    } else {
      logs = await dailyLogRepository.getRecentLogs(userId, 30);
    }

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  });
}

module.exports = new DailyLogController();
