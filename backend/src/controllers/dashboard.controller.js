/**
 * Dashboard Controller
 * Handles dashboard summary endpoints (weekly/monthly aggregates)
 */
const dailyLogRepository = require('../repositories/dailyLog.repository');
const userRepository = require('../repositories/user.repository');
const monthlySnapshotRepository = require('../repositories/monthlySnapshot.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getTodayStr, getDateNDaysAgo } = require('../utils/dateHelpers');
const { translateSummaryFields } = require('../utils/translationUtils');

class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get weekly and monthly aggregates for the student dashboard
   */
  getSummary = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get last 7 days for weekly summary
    const weeklyLogs = await dailyLogRepository.getRecentLogs(userId, 7);
    const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + log.totalEmissionKg, 0);
    const weeklyAverage = weeklyLogs.length > 0 ? weeklyTotal / weeklyLogs.length : 0;

    // Get last 30 days for monthly summary
    const monthlyLogs = await dailyLogRepository.getRecentLogs(userId, 30);
    const monthlyTotal = monthlyLogs.reduce((sum, log) => sum + log.totalEmissionKg, 0);
    const monthlyAverage = monthlyLogs.length > 0 ? monthlyTotal / monthlyLogs.length : 0;
    const totalLogsCount = await dailyLogRepository.countByUser(userId);
    const isPersonalized = totalLogsCount >= 30;
    const daysUntilPersonalized = Math.max(0, 30 - totalLogsCount);

    if (isPersonalized && !user.personalizedUnlockedAt) {
      const unlockedAt = new Date();
      await userRepository.update(userId, { personalizedUnlockedAt: unlockedAt });
      user.personalizedUnlockedAt = unlockedAt;
    }

    // Get monthly breakdown
    let monthlyBreakdown = {
      transportKg: 0,
      foodKg: 0,
      wasteKg: 0,
      energyKg: 0
    };
    monthlyLogs.forEach((log) => {
      monthlyBreakdown.transportKg += log.breakdown.transportKg;
      monthlyBreakdown.foodKg += log.breakdown.foodKg;
      monthlyBreakdown.wasteKg += log.breakdown.wasteKg;
      monthlyBreakdown.energyKg += log.breakdown.energyKg;
    });

    // Find highest emission category
    let highestCategory = 'none';
    let highestValue = 0;
    const categories = { transport: monthlyBreakdown.transportKg, food: monthlyBreakdown.foodKg, waste: monthlyBreakdown.wasteKg, energy: monthlyBreakdown.energyKg };
    for (const [cat, val] of Object.entries(categories)) {
      if (val > highestValue) {
        highestValue = val;
        highestCategory = cat;
      }
    }

    const summaryData = {
      student: {
        name: user.name,
        grade: user.grade,
        locationType: user.locationType
      },
      phase: isPersonalized ? 'personalized' : 'onboarding',
      daysUntilPersonalized,
      totalLogsCount,
      personalizedUnlockedAt: user.personalizedUnlockedAt,
      streak: user.streak,
      weekly: {
        totalDaysLogged: weeklyLogs.length,
        totalEmissionKg: parseFloat(weeklyTotal.toFixed(3)),
        averagePerDay: parseFloat(weeklyAverage.toFixed(3))
      },
      monthly: {
        totalDaysLogged: monthlyLogs.length,
        totalEmissionKg: parseFloat(monthlyTotal.toFixed(3)),
        averagePerDay: parseFloat(monthlyAverage.toFixed(3)),
        breakdown: monthlyBreakdown,
        highestEmissionCategory: highestCategory
      }
    };

    const locale = req.query.locale || req.body.locale || req.cookies?.locale || 'en';
    const responseData = translateSummaryFields(summaryData, locale);

    res.status(200).json({
      success: true,
      data: responseData
    });
  });
}

module.exports = new DashboardController();
