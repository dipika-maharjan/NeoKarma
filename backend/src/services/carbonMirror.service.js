/**
 * Carbon Mirror Service
 * Converts emissions into tree-equivalent visualizations
 * Creates relatable story: "X kg CO₂ = trees lost / trees regained"
 * Handles what-if scenarios by recomputing with hypothetical inputs
 */
const config = require('../config/env');
const emissionCalculationService = require('./emissionCalculation.service');
const monthlySnapshotRepository = require('../repositories/monthlySnapshot.repository');
const dailyLogRepository = require('../repositories/dailyLog.repository');
const AppError = require('../utils/AppError');

class CarbonMirrorService {
  /**
   * Generate Carbon Mirror story for today's emissions
   * Converts kg CO2 to tree-equivalent representation
   */
  async generateMirror(totalEmissionKg) {
    const dailyTreeAbsorption = config.DAILY_TREE_ABSORPTION_KG;
    const treesEquivalent = parseFloat((totalEmissionKg / dailyTreeAbsorption).toFixed(1));

    let story = '';
    let status = '';

    if (treesEquivalent >= 50) {
      story = `Your choices today map to the deforestation equivalent of cutting down ${treesEquivalent} mature trees' daily filtration capacity. Consider switching a few habits tomorrow!`;
      status = 'deforestation';
    } else if (treesEquivalent >= 20) {
      story = `Your daily footprint equals the daily carbon clearing load of ${treesEquivalent} trees. Small changes in transport or diet can help!`;
      status = 'deforestation';
    } else if (treesEquivalent > 0) {
      story = `Great effort! Your baseline footprint is efficient and equals roughly ${treesEquivalent} trees' daily absorption capacity.`;
      status = 'balanced';
    } else {
      story = `Excellent work! Your footprint today is negligible — you're actively contributing to carbon sequestration.`;
      status = 'afforestation';
    }

    return {
      story,
      treesEquivalent,
      status,
      kgCO2: totalEmissionKg
    };
  }

  /**
   * Generate what-if scenario by recomputing with hypothetical inputs
   * Example: "What if I took the bus instead of car 3 times this week?"
   */
  async generateWhatIfScenario(originalEmissions, hypotheticalInputs) {
    try {
      const hypotheticalEmissions = await emissionCalculationService.calculateEmissions(
        hypotheticalInputs
      );

      const reduction = originalEmissions.totalEmissionKg - hypotheticalEmissions.totalEmissionKg;
      const reductionPercent = parseFloat(
        ((reduction / originalEmissions.totalEmissionKg) * 100).toFixed(1)
      );

      return {
        originalKg: originalEmissions.totalEmissionKg,
        hypotheticalKg: hypotheticalEmissions.totalEmissionKg,
        reductionKg: parseFloat(reduction.toFixed(3)),
        reductionPercent,
        newMirror: await this.generateMirror(hypotheticalEmissions.totalEmissionKg)
      };
    } catch (error) {
      throw new AppError(`What-if scenario calculation failed: ${error.message}`, 500);
    }
  }

  /**
   * Compare current month's emissions to previous month
   */
  generateMonthComparison(currentKg, previousKg) {
    if (previousKg === 0) {
      return {
        deltaKg: currentKg,
        direction: 'noData',
        message: 'No previous month data to compare'
      };
    }

    const deltaKg = parseFloat((previousKg - currentKg).toFixed(3));

    if (deltaKg > 0) {
      return {
        deltaKg,
        direction: 'improved',
        message: `Excellent! You improved by ${deltaKg} kg CO₂ compared to last month.`,
        percentChange: parseFloat(((deltaKg / previousKg) * 100).toFixed(1))
      };
    } else if (deltaKg < 0) {
      return {
        deltaKg: Math.abs(deltaKg),
        direction: 'worsened',
        message: `Your emissions increased by ${Math.abs(deltaKg)} kg CO₂ compared to last month. Let's focus on improvements.`,
        percentChange: parseFloat(((Math.abs(deltaKg) / previousKg) * 100).toFixed(1))
      };
    } else {
      return {
        deltaKg: 0,
        direction: 'noChange',
        message: 'Your emissions are the same as last month.'
      };
    }
  }

  /**
   * Update monthly snapshot after a new daily log is created
   */
  async updateSnapshotAfterLog(userId, dateStr, emissionResult) {
    try {
      const monthStr = dateStr.slice(0, 7); // YYYY-MM
      let snapshot = await monthlySnapshotRepository.findByUserAndMonth(userId, monthStr);
      
      let updatedTotal = emissionResult.totalEmissionKg;
      let updatedLogsCount = 1;
      let updatedBreakdown = {
        transportKg: emissionResult.breakdown.transportKg,
        foodKg: emissionResult.breakdown.foodKg,
        wasteKg: emissionResult.breakdown.wasteKg,
        energyKg: emissionResult.breakdown.energyKg
      };

      if (snapshot) {
        updatedTotal = snapshot.totalEmissionKg + emissionResult.totalEmissionKg;
        updatedLogsCount = snapshot.logsCount + 1;
        updatedBreakdown = {
          transportKg: snapshot.breakdown.transportKg + emissionResult.breakdown.transportKg,
          foodKg: snapshot.breakdown.foodKg + emissionResult.breakdown.foodKg,
          wasteKg: snapshot.breakdown.wasteKg + emissionResult.breakdown.wasteKg,
          energyKg: snapshot.breakdown.energyKg + emissionResult.breakdown.energyKg
        };
      }

      // Calculate tree equivalent: totalEmissionKg / (KG_CO2_PER_TREE_PER_YEAR / 12)
      const kgTreeYear = config.KG_CO2_PER_TREE_PER_YEAR || 21;
      const treeEquivalentKg = parseFloat((updatedTotal / (kgTreeYear / 12)).toFixed(1));

      // Month-over-month comparison
      let comparedToPreviousMonth = { deltaKg: 0, direction: 'noData' };
      
      // Calculate previous month string (YYYY-MM)
      const parts = monthStr.split('-');
      let year = parseInt(parts[0]);
      let month = parseInt(parts[1]) - 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      const prevMonthStr = `${year}-${month.toString().padStart(2, '0')}`;

      const prevSnapshot = await monthlySnapshotRepository.findByUserAndMonth(userId, prevMonthStr);
      if (prevSnapshot && prevSnapshot.totalEmissionKg > 0) {
        const delta = prevSnapshot.totalEmissionKg - updatedTotal;
        comparedToPreviousMonth = {
          deltaKg: parseFloat(Math.abs(delta).toFixed(3)),
          direction: delta >= 0 ? 'improved' : 'worsened'
        };
      }

      const snapshotData = {
        totalEmissionKg: parseFloat(updatedTotal.toFixed(3)),
        logsCount: updatedLogsCount,
        breakdown: {
          transportKg: parseFloat(updatedBreakdown.transportKg.toFixed(3)),
          foodKg: parseFloat(updatedBreakdown.foodKg.toFixed(3)),
          wasteKg: parseFloat(updatedBreakdown.wasteKg.toFixed(3)),
          energyKg: parseFloat(updatedBreakdown.energyKg.toFixed(3))
        },
        treeEquivalentKg,
        comparedToPreviousMonth
      };

      if (snapshot) {
        return await monthlySnapshotRepository.update(snapshot._id, snapshotData);
      } else {
        return await monthlySnapshotRepository.create({
          userId,
          month: monthStr,
          ...snapshotData
        });
      }
    } catch (error) {
      throw new AppError(`Failed to update monthly snapshot: ${error.message}`, 500);
    }
  }

  /**
   * Run What-If simulation by applying multipliers to user's 30-day logs
   */
  async calculateWhatIfScenarioForUser(userId, multipliers) {
    const { transportMultiplier = 1, foodMultiplier = 1, energyMultiplier = 1 } = multipliers;

    // Fetch user's logs for last 30 days
    const logs = await dailyLogRepository.getRecentLogs(userId, 30);
    if (!logs || logs.length === 0) {
      throw new AppError('Insufficient log history to run simulation. Please log activities first.', 400);
    }

    let originalTransport = 0;
    let originalFood = 0;
    let originalEnergy = 0;
    let originalWaste = 0;

    logs.forEach((log) => {
      originalTransport += log.breakdown.transportKg || 0;
      originalFood += log.breakdown.foodKg || 0;
      originalEnergy += log.breakdown.energyKg || 0;
      originalWaste += log.breakdown.wasteKg || 0;
    });

    const originalTotalKg = originalTransport + originalFood + originalEnergy + originalWaste;

    // Apply multipliers
    const hypotheticalTransport = originalTransport * transportMultiplier;
    const hypotheticalFood = originalFood * foodMultiplier;
    const hypotheticalEnergy = originalEnergy * energyMultiplier;
    const hypotheticalWaste = originalWaste; // Waste remains constant

    const hypotheticalTotalKg = hypotheticalTransport + hypotheticalFood + hypotheticalEnergy + hypotheticalWaste;

    const reductionKg = originalTotalKg - hypotheticalTotalKg;
    const reductionPercent = originalTotalKg > 0 ? parseFloat(((reductionKg / originalTotalKg) * 100).toFixed(1)) : 0;

    // Generate trees equivalent for new total
    const hypotheticalMirror = await this.generateMirror(hypotheticalTotalKg);

    return {
      originalKg: parseFloat(originalTotalKg.toFixed(3)),
      hypotheticalKg: parseFloat(hypotheticalTotalKg.toFixed(3)),
      reductionKg: parseFloat(reductionKg.toFixed(3)),
      reductionPercent,
      newMirror: hypotheticalMirror
    };
  }
}

module.exports = new CarbonMirrorService();
