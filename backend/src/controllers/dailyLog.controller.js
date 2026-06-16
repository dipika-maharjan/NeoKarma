/**
 * Daily Log Controller
 * Handles daily activity logging and history retrieval
 */
const dailyLogRepository = require('../repositories/dailyLog.repository');
const emissionCalculationService = require('../services/emissionCalculation.service');
const streakService = require('../services/streak.service');
const carbonMirrorService = require('../services/carbonMirror.service');
const monthlySnapshotRepository = require('../repositories/monthlySnapshot.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getTodayStr } = require('../utils/dateHelpers');

class DailyLogController {
  /**
   * POST /api/daily-log
   * Submit today's carbon footprint log
   * Rejects if user already logged today
   */
  submitLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const {
      transportationMode,
      transportationDistanceKm,
      foodMealType,
      wasteAndPlasticCount,
      energyUsageHours,
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

    // Check if already logged today
    const existingLog = await dailyLogRepository.findByUserAndDate(userId, today);
    if (existingLog) {
      // Allow update: delete old and create new
      await dailyLogRepository.update(existingLog._id, {
        transportation: { mode: transportationMode, distanceKm: transportationDistanceKm },
        food: { mealType: foodMealType },
        wasteAndPlastic: { plasticItemCount: wasteAndPlasticCount },
        energy: { usageHours: energyUsageHours },
        extraAnswer: extraAnswer || null
      });
    } else {
      // Calculate emissions using service
      const emissionResult = await emissionCalculationService.calculateEmissions({
        transportationMode,
        transportationDistanceKm,
        foodMealType,
        wasteAndPlasticCount,
        energyUsageHours
      });

      // Create log
      await dailyLogRepository.create({
        userId,
        date: today,
        transportation: { mode: transportationMode, distanceKm: transportationDistanceKm },
        food: { mealType: foodMealType },
        wasteAndPlastic: { plasticItemCount: wasteAndPlasticCount },
        energy: { usageHours: energyUsageHours },
        extraAnswer: extraAnswer || null,
        breakdown: emissionResult.breakdown,
        totalEmissionKg: emissionResult.totalEmissionKg
      });

      // Update streak
      await streakService.updateStreakAfterLogCreation(userId);

      // Update monthly snapshot
      const monthStr = today.slice(0, 7); // YYYY-MM
      const snapshot = await monthlySnapshotRepository.findByUserAndMonth(userId, monthStr);
      if (snapshot) {
        await monthlySnapshotRepository.update(snapshot._id, {
          totalEmissionKg: snapshot.totalEmissionKg + emissionResult.totalEmissionKg,
          logsCount: snapshot.logsCount + 1,
          'breakdown.transportKg': snapshot.breakdown.transportKg + emissionResult.breakdown.transportKg,
          'breakdown.foodKg': snapshot.breakdown.foodKg + emissionResult.breakdown.foodKg,
          'breakdown.wasteKg': snapshot.breakdown.wasteKg + emissionResult.breakdown.wasteKg,
          'breakdown.energyKg': snapshot.breakdown.energyKg + emissionResult.breakdown.energyKg
        });
      }
    }

    // Get updated log
    const log = await dailyLogRepository.findByUserAndDate(userId, today);

    // Generate Carbon Mirror
    const mirror = await carbonMirrorService.generateMirror(log.totalEmissionKg);

    res.status(201).json({
      success: true,
      message: 'Daily log submitted successfully',
      data: {
        log,
        mirror
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
