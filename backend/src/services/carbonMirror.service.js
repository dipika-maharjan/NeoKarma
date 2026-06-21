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
   * Build a language-aware prompt for tree story generation
   */
  buildTreeStoryPrompt(treesEquivalent, locale) {
    const languageInstruction = locale === 'ne' || locale === 'np'
      ? 'Respond ONLY in Nepali (Devanagari script). Do not include any English words except technical units like kg, km, CO2.'
      : 'Respond in English.';

    return `${languageInstruction}

You are generating a short, factual environmental cost message for a student based on their daily carbon footprint equivalent to trees.

Trees equivalent: ${treesEquivalent}

Generate a single factual sentence that:
1. States the numeric tree equivalent and what it means for their daily footprint
2. Uses neutral wording only
3. Does not praise, congratulate, scold, or suggest behavior change

Respond with ONLY the story text, no explanations.`;
  }

  /**
   * Generate Carbon Mirror story for today's emissions
   * Converts kg CO2 to tree-equivalent representation
   * Now locale-aware
   */
  async generateMirror(totalEmissionKg, locale = 'en') {
    // Compare a day's emissions against a tree's MONTHLY filtration capacity
    const monthlyTreeAbsorption = config.MONTHLY_TREE_ABSORPTION_KG || (config.KG_CO2_PER_TREE_PER_YEAR / 12);
    const treesEquivalent = parseFloat((totalEmissionKg / monthlyTreeAbsorption).toFixed(1));

    let story = '';
    let status = '';

    // Generate stories based on locale
    if (locale === 'ne' || locale === 'np') {
      story = `तपाईंको आजको पदचिह्न लगभग ${treesEquivalent} परिपक्व रूखहरूको मासिक अवशोषण क्षमतासँग बराबर छ।`;
    } else {
      story = `Your footprint today equals roughly ${treesEquivalent} mature trees' monthly absorption capacity.`;
    }

    if (treesEquivalent >= 50) {
      status = 'deforestation';
    } else if (treesEquivalent >= 20) {
      status = 'deforestation';
    } else if (treesEquivalent > 0) {
      status = 'balanced';
    } else {
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
   * Now locale-aware
   */
  generateMonthComparison(currentKg, previousKg, locale = 'en') {
    if (previousKg === 0) {
      const noDataMsg = locale === 'ne' || locale === 'np'
        ? 'तुलना गर्नको लागि कुनै अघिल्लो महिनाको डेटा छैन'
        : 'No previous month data to compare';
      
      return {
        deltaKg: currentKg,
        direction: 'noData',
        message: noDataMsg
      };
    }

    const deltaKg = parseFloat((previousKg - currentKg).toFixed(3));

    if (deltaKg > 0) {
      const improvedMsg = locale === 'ne' || locale === 'np'
        ? `उत्कृष्ट! तपाइँले गत महिनाको तुलनामा ${deltaKg} किग्रा CO₂ मा सुधार गर्नुभयो।`
        : `Excellent! You improved by ${deltaKg} kg CO₂ compared to last month.`;
      
      return {
        deltaKg,
        direction: 'improved',
        message: improvedMsg,
        percentChange: parseFloat(((deltaKg / previousKg) * 100).toFixed(1))
      };
    } else if (deltaKg < 0) {
      const worsenedMsg = locale === 'ne' || locale === 'np'
        ? `आपको उत्सर्जन गत महिनाको तुलनामा ${Math.abs(deltaKg)} किग्रा CO₂ ले बढ्यो। सुधारमा ध्यान केन्द्रित गरौं।`
        : `Your emissions increased by ${Math.abs(deltaKg)} kg CO₂ compared to last month. Let's focus on improvements.`;
      
      return {
        deltaKg: Math.abs(deltaKg),
        direction: 'worsened',
        message: worsenedMsg,
        percentChange: parseFloat(((Math.abs(deltaKg) / previousKg) * 100).toFixed(1))
      };
    } else {
      const noChangeMsg = locale === 'ne' || locale === 'np'
        ? 'आपको उत्सर्जन गत महिनाको जस्तै छ।'
        : 'Your emissions are the same as last month.';
      
      return {
        deltaKg: 0,
        direction: 'noChange',
        message: noChangeMsg
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

  async getMonthlyAggregate(userId, monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = `${monthStr}-01`;
    const endDate = `${monthStr}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
    const aggregationResult = await dailyLogRepository.getAggregateEmissions(userId, startDate, endDate);
    const aggregate = Array.isArray(aggregationResult) && aggregationResult.length > 0 ? aggregationResult[0] : null;

    if (!aggregate || aggregate.totalEmissionKg === 0) {
      return null;
    }

    return {
      totalEmissionKg: parseFloat(aggregate.totalEmissionKg.toFixed(3)),
      logCount: aggregate.logCount,
      breakdown: {
        transportKg: parseFloat((aggregate.transportKg || 0).toFixed(3)),
        foodKg: parseFloat((aggregate.foodKg || 0).toFixed(3)),
        wasteKg: parseFloat((aggregate.wasteKg || 0).toFixed(3)),
        energyKg: parseFloat((aggregate.energyKg || 0).toFixed(3))
      }
    };
  }

  async generateMirrorFromLogs(userId, monthStr, locale = 'en') {
    const monthlyAggregate = await this.getMonthlyAggregate(userId, monthStr);
    if (!monthlyAggregate) {
      return null;
    }

    const mirror = await this.generateMirror(monthlyAggregate.totalEmissionKg, locale);
    return {
      ...mirror,
      totalEmissionKg: monthlyAggregate.totalEmissionKg,
      logsCount: monthlyAggregate.logCount,
      breakdown: monthlyAggregate.breakdown
    };
  }

  async getMonthlyHistory(userId, monthStr, months = 6) {
    const rawSnapshots = await monthlySnapshotRepository.findByUser(userId);
    const history = rawSnapshots.slice(0, months).map((snapshot) => ({
      month: snapshot.month,
      totalEmissionKg: snapshot.totalEmissionKg,
      treesEquivalent: snapshot.treeEquivalentKg,
      hasSnapshot: true
    }));

    const hasCurrentMonth = history.some((entry) => entry.month === monthStr);
    if (!hasCurrentMonth) {
      const currentAggregate = await this.getMonthlyAggregate(userId, monthStr);
      if (currentAggregate) {
        history.unshift({
          month: monthStr,
          totalEmissionKg: currentAggregate.totalEmissionKg,
          treesEquivalent: parseFloat((currentAggregate.totalEmissionKg / (config.KG_CO2_PER_TREE_PER_YEAR / 12)).toFixed(1)),
          hasSnapshot: false
        });
      }
    }

    return history.slice(0, months).reverse();
  }
}

module.exports = new CarbonMirrorService();
