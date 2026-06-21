/**
 * Fallback Rule-Based AI Provider
 * Deterministic rules engine that guarantees plan generation even if external AI is unavailable
 * Based on simple heuristics from aggregated daily emissions patterns.
 * 
 * Generates rich layout-compatible recommendation data mapped directly to RecommendationsView.jsx.
 */
const AIProviderInterface = require('./aiProvider.interface');

class FallbackRuleProvider extends AIProviderInterface {
  /**
   * Generate recommendations using rule-based logic
   */
  async generateRecommendations(aggregatedData, userProfile) {
    const recommendations = [];
    const { transportKg, foodKg, wasteKg, energyKg, dailyBreakdown, realDataDays = 0 } = aggregatedData;

    // AI Rule 1: Transportation
    const carDays = (dailyBreakdown || []).filter(
      (log) => log.transportation && log.transportation.mode === 'car'
    ).length;
    
    if (carDays >= 2) {
      recommendations.push({
        id: 'bus',
        category: 'transportation',
        text: 'Use School Buses More Efficiently',
        title: 'Use School Buses More Efficiently',
        badge: transportKg > 8 ? 'HIGH IMPACT' : 'MEDIUM IMPACT',
        badgeColor: transportKg > 8 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100',
        description: realDataDays >= 2 
          ? `We noticed ${carDays} car trips in your recent history. Optimizing bus routes can reduce fuel use significantly.`
          : `Optimizing bus routes can reduce fuel use significantly. Switch to school buses to cut individual car usage.`,
        reduction: `-${(transportKg * 0.6).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'bus',
        estimatedReductionKg: parseFloat((transportKg * 0.6).toFixed(2)),
        personalSaving: parseFloat((transportKg * 0.6 / 3).toFixed(1)),
        effortLevel: transportKg > 8 ? 'high' : 'medium',
        actionDesc: 'Switching to school buses twice a week reduces individual car usage significantly.'
      });
    }

    // AI Rule 2: Food
    const nonVegDays = (dailyBreakdown || []).filter(
      (log) => log.food && log.food.mealType === 'non-vegetarian'
    ).length;
    
    if (nonVegDays >= 2) {
      recommendations.push({
        id: 'food',
        category: 'food',
        text: 'Try Vegetarian Days',
        title: 'Try Vegetarian Days',
        badge: foodKg > 7 ? 'HIGH IMPACT' : 'MEDIUM IMPACT',
        badgeColor: foodKg > 7 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100',
        description: realDataDays >= 2 
          ? `Based on your ${nonVegDays} non-veg meals, 1-2 vegetarian days per week in the canteen can cut food emissions by up to 40%.`
          : `1-2 vegetarian days per week in the canteen can cut food emissions by up to 40%.`,
        reduction: `-${(foodKg * 0.3).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'fork-knife',
        estimatedReductionKg: parseFloat((foodKg * 0.3).toFixed(2)),
        personalSaving: parseFloat((foodKg * 0.3 / 3).toFixed(1)),
        effortLevel: foodKg > 7 ? 'high' : 'medium',
        actionDesc: 'Try a vegetarian meal once or twice a week during canteen school lunches.'
      });
    }

    // AI Rule 3: Waste
    if (wasteKg > 0.7) {
      recommendations.push({
        id: 'waste',
        category: 'waste',
        text: 'Improve Waste Sorting',
        title: 'Improve Waste Sorting',
        badge: 'MEDIUM IMPACT',
        badgeColor: 'bg-[#E2F0D9] text-[#0A3D25] border border-[#C5E0B4]',
        description: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.',
        reduction: `-${(wasteKg * 0.4).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'bin',
        estimatedReductionKg: parseFloat((wasteKg * 0.4).toFixed(2)),
        personalSaving: parseFloat((wasteKg * 0.4 / 3).toFixed(1)),
        effortLevel: 'medium',
        actionDesc: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.'
      });
    }

    // AI Rule 4: Energy
    if (energyKg > 0.3) {
      recommendations.push({
        id: 'energy',
        category: 'energy',
        text: 'Switch Off Lights & Fans',
        title: 'Switch Off Lights & Fans',
        badge: 'EASY WIN',
        badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
        description: 'Turn off when not in use. A small habit that leads to a big impact over a school term.',
        reduction: `-${(energyKg * 0.2).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'lightbulb',
        estimatedReductionKg: parseFloat((energyKg * 0.2).toFixed(2)),
        personalSaving: parseFloat((energyKg * 0.2 / 3).toFixed(1)),
        effortLevel: 'low',
        actionDesc: 'Developing the habit of turning off electrical appliances when leaving the room.'
      });
    }

    // Fallbacks if no category-specific recommendations triggered
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'energy',
        category: 'energy',
        text: 'Switch Off Lights & Fans',
        title: 'Switch Off Lights & Fans',
        badge: 'EASY WIN',
        badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
        description: 'Turn off school or home lights when you leave. A habit that cuts waste easily.',
        reduction: '-1.2 kg CO2',
        reductionUnit: '/week',
        visualType: 'lightbulb',
        estimatedReductionKg: 1.2,
        personalSaving: 1.5,
        effortLevel: 'low',
        actionDesc: 'Developing the habit of turning off electrical appliances when leaving the room.'
      });
      recommendations.push({
        id: 'waste',
        category: 'waste',
        text: 'Improve Waste Sorting',
        title: 'Improve Waste Sorting',
        badge: 'MEDIUM IMPACT',
        badgeColor: 'bg-[#E2F0D9] text-[#0A3D25] border border-[#C5E0B4]',
        description: 'Ensure plastic items are placed in recycle bins instead of standard waste bins.',
        reduction: '-0.7 kg CO2',
        reductionUnit: '/week',
        visualType: 'bin',
        estimatedReductionKg: 0.7,
        personalSaving: 1.0,
        effortLevel: 'medium',
        actionDesc: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.'
      });
    }

    return recommendations;
  }

  getProviderInfo() {
    return {
      name: 'FallbackRuleProvider',
      type: 'rule-based',
      status: 'always available',
      deterministic: true
    };
  }
}

module.exports = new FallbackRuleProvider();
