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

    const totalDays = realDataDays || 30;

    // Aggregate counts and sums
    const carOrMotorbikeDays = (dailyBreakdown || []).filter(
      (log) => log.transportation && (log.transportation.mode === 'car' || log.transportation.mode === 'motorbike')
    ).length;

    const nonVegOrMixedDays = (dailyBreakdown || []).filter(
      (log) => log.food && (log.food.mealType === 'non-vegetarian' || log.food.mealType === 'mixed')
    ).length;

    const foodWasteGrams = (dailyBreakdown || []).reduce(
      (sum, log) => sum + (log.food?.foodWasteGrams || 0), 0
    );

    const plasticItemCount = (dailyBreakdown || []).reduce(
      (sum, log) => sum + (log.wasteAndPlastic?.plasticItemCount || 0), 0
    );

    const unsegregatedDays = (dailyBreakdown || []).filter(
      (log) => log.wasteAndPlastic && log.wasteAndPlastic.segregated === false
    ).length;

    const highEnergyDays = (dailyBreakdown || []).filter(
      (log) => log.energy && log.energy.usageHours >= 4
    ).length;

    const firewoodDays = (dailyBreakdown || []).filter(
      (log) => log.energy && log.energy.firewoodKg > 0
    ).length;

    const avgPlastic = plasticItemCount / totalDays;
    const avgFoodWaste = foodWasteGrams / totalDays;

    // AI Rule 1: Transportation
    if (carOrMotorbikeDays >= 2 || transportKg > 5) {
      recommendations.push({
        id: 'bus',
        category: 'transportation',
        text: 'Use School Buses More Efficiently',
        title: 'Use School Buses More Efficiently',
        badge: transportKg > 10 ? 'HIGH IMPACT' : 'MEDIUM IMPACT',
        badgeColor: transportKg > 10 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100',
        description: `We detected private car/motorbike commute on ${carOrMotorbikeDays} days recently. Switching to the school bus or shared routes twice a week cuts emissions.`,
        reduction: `-${(transportKg * 0.45).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'bus',
        estimatedReductionKg: parseFloat((transportKg * 0.45).toFixed(2)),
        personalSaving: parseFloat((transportKg * 0.45).toFixed(1)),
        effortLevel: transportKg > 10 ? 'high' : 'medium',
        actionDesc: 'Take the school bus or shared transportation at least 2 days a week to lower driving footprints.'
      });
      
      recommendations.push({
        id: 'walk-cycle',
        category: 'transportation',
        text: 'Walk or Cycle for Short Trips',
        title: 'Walk or Cycle for Short Trips',
        badge: 'EASY WIN',
        badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
        description: 'For travel under 2km, walk or bicycle instead of taking motor vehicles. Helps keep localized air clean.',
        reduction: `-${(transportKg * 0.15).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'lightbulb',
        estimatedReductionKg: parseFloat((transportKg * 0.15).toFixed(2)),
        personalSaving: parseFloat((transportKg * 0.15).toFixed(1)),
        effortLevel: 'low',
        actionDesc: 'Use walking or cycling for short neighborhood errands instead of a private vehicle.'
      });
    }

    // AI Rule 2: Food & Diet
    if (nonVegOrMixedDays >= 2 || foodKg > 6) {
      recommendations.push({
        id: 'food',
        category: 'food',
        text: 'Try Vegetarian Days',
        title: 'Try Vegetarian Days',
        badge: foodKg > 8 ? 'HIGH IMPACT' : 'MEDIUM IMPACT',
        badgeColor: foodKg > 8 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100',
        description: `You logged mixed/meat lunches on ${nonVegOrMixedDays} days. Substituting meat with local vegetarian meals can cut food emissions up to 40%.`,
        reduction: `-${(foodKg * 0.35).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'fork-knife',
        estimatedReductionKg: parseFloat((foodKg * 0.35).toFixed(2)),
        personalSaving: parseFloat((foodKg * 0.35).toFixed(1)),
        effortLevel: foodKg > 8 ? 'high' : 'medium',
        actionDesc: 'Switch your school lunches to vegetarian options twice a week.'
      });
    }

    if (avgFoodWaste > 40) {
      recommendations.push({
        id: 'food-waste',
        category: 'food',
        text: 'Reduce Food Waste',
        title: 'Reduce Food Waste & Pack Lunch Smartly',
        badge: 'MEDIUM IMPACT',
        badgeColor: 'bg-green-50 text-green-600 border border-green-100',
        description: `Your average food waste is ${avgFoodWaste.toFixed(0)} grams. Consuming smaller portions and packing dry items prevents kitchen emissions.`,
        reduction: `-${(foodKg * 0.15).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'fork-knife',
        estimatedReductionKg: parseFloat((foodKg * 0.15).toFixed(2)),
        personalSaving: parseFloat((foodKg * 0.15).toFixed(1)),
        effortLevel: 'medium',
        actionDesc: 'Finish school lunches completely and pack leftover waste in compost bins.'
      });
    }

    // AI Rule 3: Waste & Plastic
    if (avgPlastic >= 1.5 || wasteKg > 0.5) {
      recommendations.push({
        id: 'waste',
        category: 'waste',
        text: 'Bring Reusable Steel Bottle',
        title: 'Swap to Reusable Stainless Steel Bottles',
        badge: 'MEDIUM IMPACT',
        badgeColor: 'bg-[#E2F0D9] text-[#0A3D25] border border-[#C5E0B4]',
        description: `You consumed ${plasticItemCount} single-use plastic items this week. Bringing a reusable metal bottle avoids plastic trash.`,
        reduction: `-${(wasteKg * 0.4).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'bin',
        estimatedReductionKg: parseFloat((wasteKg * 0.4).toFixed(2)),
        personalSaving: parseFloat((wasteKg * 0.4).toFixed(1)),
        effortLevel: 'medium',
        actionDesc: 'Bring a reusable steel water bottle instead of buying single-use bottled water.'
      });
    }

    if (unsegregatedDays > 0) {
      recommendations.push({
        id: 'segregation',
        category: 'waste',
        text: 'Classroom & Home Waste Segregation',
        title: 'Classroom & Home Waste Segregation',
        badge: 'EASY WIN',
        badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
        description: `We noticed unsegregated garbage on ${unsegregatedDays} days. Sorting plastics from dry paper makes recycling efficient.`,
        reduction: '-1.5 kg CO2',
        reductionUnit: '/week',
        visualType: 'bin',
        estimatedReductionKg: 1.5,
        personalSaving: 1.5,
        effortLevel: 'low',
        actionDesc: 'Set up separate dry (paper, plastic) and organic (food waste) bins at home and school.'
      });
    }

    // AI Rule 4: Energy
    if (highEnergyDays >= 2 || energyKg > 0.4) {
      recommendations.push({
        id: 'energy',
        category: 'energy',
        text: 'Switch Off Lights & Fans',
        title: 'Power Down Idle Lights & Screens',
        badge: 'EASY WIN',
        badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
        description: `You logged high appliance usage (${highEnergyDays} days). Turning off school smartboards and bedroom lights when leaving saves energy.`,
        reduction: `-${(energyKg * 0.25).toFixed(0)} kg CO2`,
        reductionUnit: '/week',
        visualType: 'lightbulb',
        estimatedReductionKg: parseFloat((energyKg * 0.25).toFixed(2)),
        personalSaving: parseFloat((energyKg * 0.25).toFixed(1)),
        effortLevel: 'low',
        actionDesc: 'Switch off classroom smartboards and fans immediately when empty.'
      });
    }

    // Rural biomass rule
    if (firewoodDays > 0) {
      recommendations.push({
        id: 'biomass-dry',
        category: 'energy',
        text: 'Store Firewood Dry & Use Ventilation',
        title: 'Biomass Cookstove Storage Optimization',
        badge: 'HIGH IMPACT',
        badgeColor: 'bg-red-50 text-red-500 border border-red-100',
        description: 'Keeping firewood dry reduces smoke and improves heating efficiency by 20-30%, reducing firewood requirements.',
        reduction: '-3.0 kg CO2',
        reductionUnit: '/week',
        visualType: 'lightbulb',
        estimatedReductionKg: 3.0,
        personalSaving: 3.5,
        effortLevel: 'high',
        actionDesc: 'Keep firewood dry under shelter and improve room airflow during biomass stove use.'
      });
    }

    // Default Fallback
    if (recommendations.length < 2) {
      recommendations.push({
        id: 'energy',
        category: 'energy',
        text: 'Switch Off Lights & Fans',
        title: 'Power Down Idle Lights & Screens',
        badge: 'EASY WIN',
        badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
        description: 'Developing the habit of turning off electrical appliances when leaving the room.',
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
        description: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.',
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
