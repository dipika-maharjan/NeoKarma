/**
 * Carbon Mirror Service
 * Converts emissions into tree-equivalent visualizations
 * Creates relatable story: "X kg CO₂ = trees lost / trees regained"
 * Handles what-if scenarios by recomputing with hypothetical inputs
 */
const config = require('../config/env');
const emissionCalculationService = require('./emissionCalculation.service');
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
}

module.exports = new CarbonMirrorService();
