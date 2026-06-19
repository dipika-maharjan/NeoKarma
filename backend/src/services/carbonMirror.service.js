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

You are generating a short, motivational "tree mirror" story for a student based on their daily carbon footprint equivalent to trees.

Trees equivalent: ${treesEquivalent}

Generate a short (1-2 sentences) motivational message that:
1. Describes what ${treesEquivalent} trees means in context of their daily carbon footprint
2. If high (>20 trees), suggest practical changes they could make
3. If low (≤20 trees), congratulate them on good choices
4. Keep tone encouraging, not preachy

Respond with ONLY the story text, no explanations.`;
  }

  /**
   * Generate Carbon Mirror story for today's emissions
   * Converts kg CO2 to tree-equivalent representation
   * Now locale-aware
   */
  async generateMirror(totalEmissionKg, locale = 'en') {
    const dailyTreeAbsorption = config.DAILY_TREE_ABSORPTION_KG;
    const treesEquivalent = parseFloat((totalEmissionKg / dailyTreeAbsorption).toFixed(1));

    let story = '';
    let status = '';

    // Generate stories based on locale
    if (locale === 'ne' || locale === 'np') {
      // Nepali stories
      if (treesEquivalent >= 50) {
        story = `आपको आज को छनोटहरू ${treesEquivalent} परिपक्व रूखको दैनिक फिल्टरेशन क्षमताको बन वनस्पति घटाउने बराबर छन्। भोलि केहি बानीहरू परिवर्तन गर्न विचार गर्नुहोस्!`;
        status = 'deforestation';
      } else if (treesEquivalent >= 20) {
        story = `आपको दैनिक कार्बन पदचिह्न ${treesEquivalent} रूखको दैनिक कार्बन क्लीयरिंग लोडको बराबर छ। यातायात वा आहारमा साना परिवर्तनहरू मदद गर्न सक्छन्!`;
        status = 'deforestation';
      } else if (treesEquivalent > 0) {
        story = `उत्कृष्ट प्रयास! आपको आधारभूत पदचिह्न कुशल छ र लगभग ${treesEquivalent} रूखको दैनिक अवशोषण क्षमताको बराबर छ।`;
        status = 'balanced';
      } else {
        story = `उत्कृष्ट काम! आपको आज को पदचिह्न नगण्य छ — तपाइँ सक्रिय रूपमा कार्बन पृथक्करणमा योगदान गर्दै हुनुहुन्छ।`;
        status = 'afforestation';
      }
    } else {
      // English stories (default)
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
}

module.exports = new CarbonMirrorService();
