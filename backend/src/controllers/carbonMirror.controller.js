/**
 * Carbon Mirror Controller
 * Handles carbon mirror (tree equivalent) visualization and what-if scenarios
 */
const dailyLogRepository = require('../repositories/dailyLog.repository');
const monthlySnapshotRepository = require('../repositories/monthlySnapshot.repository');
const carbonMirrorService = require('../services/carbonMirror.service');
const emissionCalculationService = require('../services/emissionCalculation.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getTodayStr } = require('../utils/dateHelpers');

class CarbonMirrorController {
  /**
   * GET /api/carbon-mirror
   * Get current period tree-equivalent story + what-if scenarios
   * Query params: locale (en or ne)
   */
  getMirror = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const locale = req.query.locale || req.locale || 'en';
    const today = getTodayStr();

    // Get today's log if exists
    const todayLog = await dailyLogRepository.findByUserAndDate(userId, today);

    // Get this month's snapshot
    const monthStr = today.slice(0, 7);
    const snapshot = await monthlySnapshotRepository.findByUserAndMonth(userId, monthStr);

    let currentMirror = null;
    let monthlyMirror = null;
    let previousMonthComparison = null;

    if (todayLog) {
      currentMirror = await carbonMirrorService.generateMirror(todayLog.totalEmissionKg, locale);
    }

    if (snapshot) {
      monthlyMirror = await carbonMirrorService.generateMirror(snapshot.totalEmissionKg, locale);

      // Compare to previous month if exists
      const previousMonth = new Date(today);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const prevMonthStr = previousMonth.toISOString().slice(0, 7);

      const prevSnapshot = await monthlySnapshotRepository.findByUserAndMonth(userId, prevMonthStr);
      if (prevSnapshot) {
        previousMonthComparison = await carbonMirrorService.generateMonthComparison(
          snapshot.totalEmissionKg,
          prevSnapshot.totalEmissionKg,
          locale
        );
      } else {
        const prevMonthAggregate = await carbonMirrorService.getMonthlyAggregate(userId, prevMonthStr);
        if (prevMonthAggregate) {
          previousMonthComparison = await carbonMirrorService.generateMonthComparison(
            snapshot.totalEmissionKg,
            prevMonthAggregate.totalEmissionKg,
            locale
          );
        }
      }
    } else {
      monthlyMirror = await carbonMirrorService.generateMirrorFromLogs(userId, monthStr, locale);
      if (monthlyMirror) {
        const previousMonth = new Date(today);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const prevMonthStr = previousMonth.toISOString().slice(0, 7);

        const prevSnapshot = await monthlySnapshotRepository.findByUserAndMonth(userId, prevMonthStr);
        if (prevSnapshot) {
          previousMonthComparison = await carbonMirrorService.generateMonthComparison(
            monthlyMirror.totalEmissionKg,
            prevSnapshot.totalEmissionKg,
            locale
          );
        } else {
          const prevMonthAggregate = await carbonMirrorService.getMonthlyAggregate(userId, prevMonthStr);
          if (prevMonthAggregate) {
            previousMonthComparison = await carbonMirrorService.generateMonthComparison(
              monthlyMirror.totalEmissionKg,
              prevMonthAggregate.totalEmissionKg,
              locale
            );
          }
        }
      }
    }

    const monthlyHistory = await carbonMirrorService.getMonthlyHistory(userId, monthStr, 6);

    res.status(200).json({
      success: true,
      data: {
        today: currentMirror,
        thisMonth: monthlyMirror,
        monthComparison: previousMonthComparison,
        history: monthlyHistory
      }
    });
  });

  /**
   * POST /api/carbon-mirror/what-if
   * Calculate what-if scenario with hypothetical multipliers
   * Body: { transportMultiplier, foodMultiplier, energyMultiplier }
   */
  calculateWhatIf = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { transportMultiplier, foodMultiplier, energyMultiplier } = req.body;

    const scenario = await carbonMirrorService.calculateWhatIfScenarioForUser(userId, {
      transportMultiplier,
      foodMultiplier,
      energyMultiplier
    });

    res.status(200).json({
      success: true,
      data: scenario
    });
  });
}

module.exports = new CarbonMirrorController();
