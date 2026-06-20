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
      energyUsageKg,
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

    const date = req.body.date || getTodayStr();

    const emissionResult = await emissionCalculationService.calculateEmissions({
      transportationMode,
      transportationDistanceKm,
      foodMealType,
      wasteAndPlasticCount,
      energyUsageHours,
      energyUsageKg: energyUsageKg || 0
    });

    const logPayload = {
      userId,
      date,
      transportation: { mode: transportationMode, distanceKm: transportationDistanceKm },
      food: { mealType: foodMealType },
      wasteAndPlastic: { plasticItemCount: wasteAndPlasticCount },
      energy: { usageHours: energyUsageHours, firewoodKg: energyUsageKg || 0 },
      extraAnswer: extraAnswer || null,
      breakdown: emissionResult.breakdown,
      totalEmissionKg: emissionResult.totalEmissionKg
    };

    const upsertResult = await dailyLogRepository.upsertByUserAndDate(userId, date, logPayload);
    // Mongoose rawResult can vary by driver/version; ensure we have the created/updated doc
    let createdLog = upsertResult?.value;
    if (!createdLog) {
      createdLog = await dailyLogRepository.findByUserAndDate(userId, date);
    }
    const isExistingLog = upsertResult.lastErrorObject?.updatedExisting === true;
    let updatedStreak = null;

    if (!isExistingLog) {
      const updatedUser = await streakService.updateStreakAfterLogCreation(userId);
      updatedStreak = updatedUser?.streak || null;
    }

    await carbonMirrorService.updateSnapshotAfterLog(userId, date, emissionResult);

    const mirror = await carbonMirrorService.generateMirror(createdLog.totalEmissionKg);
    const statusCode = isExistingLog ? 200 : 201;

    res.status(statusCode).json({
      success: true,
      message: isExistingLog ? 'Daily log updated successfully' : 'Daily log submitted successfully',
      data: {
        log: createdLog,
        mirror,
        updatedStreak
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
