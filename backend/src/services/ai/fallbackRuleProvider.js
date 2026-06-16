/**
 * Fallback Rule-Based AI Provider
 * Deterministic rules engine that guarantees plan generation even if external AI is unavailable
 * Based on simple heuristics from aggregated daily emissions patterns
 * 
 * This is NOT a "dumb" fallback - it's a real rules-based recommendation system
 * that ensures the app never breaks and the demo always works.
 */
const AIProviderInterface = require('./aiProvider.interface');

class FallbackRuleProvider extends AIProviderInterface {
  /**
   * Generate recommendations using rule-based logic
   */
  async generateRecommendations(aggregatedData, userProfile) {
    const recommendations = [];
    const { transportKg, foodKg, wasteKg, energyKg, totalEmissionKg, dailyBreakdown } =
      aggregatedData;

    // Rule 1: Transportation is the largest category
    if (transportKg > foodKg && transportKg > wasteKg && transportKg > energyKg) {
      // Check if car mode is frequent
      const carDays = (dailyBreakdown || []).filter(
        (log) => log.transportation.mode === 'car'
      ).length;

      if (carDays >= 3) {
        recommendations.push({
          text: 'Switch to school bus or carpooling',
          description: `You used a car ${carDays} times in the last 30 days. The school bus or carpooling can reduce your transport emissions significantly while saving money.`,
          estimatedReductionKg: parseFloat((transportKg * 0.6).toFixed(2)), // Estimate 60% reduction
          effortLevel: 'medium',
          category: 'transportation',
          context: `Based on your ${carDays} car trips last month`
        });
      } else if (carDays >= 1) {
        recommendations.push({
          text: 'Consider biking or walking when possible',
          description:
            'For short-distance trips, biking or walking is zero-emission and healthier.',
          estimatedReductionKg: parseFloat((transportKg * 0.3).toFixed(2)),
          effortLevel: 'low',
          category: 'transportation',
          context: 'Build sustainable commute habits'
        });
      }
    }

    // Rule 2: Food category analysis
    if (foodKg > 0) {
      const nonVegDays = (dailyBreakdown || []).filter(
        (log) => log.food.mealType === 'non-vegetarian'
      ).length;

      if (nonVegDays >= 15) {
        recommendations.push({
          text: 'Introduce Meatless Mondays',
          description:
            'Try vegetarian or vegan meals one day per week. This significantly reduces your food carbon footprint.',
          estimatedReductionKg: parseFloat((foodKg * 0.25).toFixed(2)),
          effortLevel: 'low',
          category: 'food',
          context: `You had non-veg meals ${nonVegDays} times last month`
        });
      } else if (nonVegDays > 0) {
        recommendations.push({
          text: 'Try plant-based meal alternatives',
          description:
            'Plant-based proteins like lentils, chickpeas, and beans have much lower emissions.',
          estimatedReductionKg: parseFloat((foodKg * 0.15).toFixed(2)),
          effortLevel: 'low',
          category: 'food',
          context: 'Explore sustainable nutrition'
        });
      }
    }

    // Rule 3: Waste and plastic
    if (wasteKg > 3) {
      recommendations.push({
        text: 'Reduce single-use plastics',
        description:
          'Bring your own reusable water bottle, lunch container, and shopping bag. Reduce unnecessary packaging.',
        estimatedReductionKg: parseFloat((wasteKg * 0.4).toFixed(2)),
        effortLevel: 'low',
        category: 'waste',
        context: 'Your plastic footprint can be easily reduced'
      });
    }

    // Rule 4: Energy usage
    if (energyKg > 2) {
      recommendations.push({
        text: 'Form a Classroom Power-Down Committee',
        description:
          'Monitor and turn off lights, fans, and screens during recess and lunch. Small actions add up.',
        estimatedReductionKg: parseFloat((energyKg * 0.2).toFixed(2)),
        effortLevel: 'low',
        category: 'energy',
        context: 'Engage your friends in energy conservation'
      });
    }

    // Rule 5: Always include a general habit recommendation
    if (recommendations.length > 0) {
      recommendations.push({
        text: 'Track your progress and share with friends',
        description:
          'Creating awareness among peers is the most powerful lever for behavior change. Share your Carbon Mirror story.',
        estimatedReductionKg: 0, // Indirect impact
        effortLevel: 'low',
        category: 'general',
        context: 'Amplify your impact through social influence'
      });
    } else {
      // If no category-specific rules triggered, provide basic encouragement
      recommendations.push({
        text: 'Maintain your current sustainable habits',
        description:
          'Your emissions are already low. Keep logging daily to reinforce positive behaviors.',
        estimatedReductionKg: 0,
        effortLevel: 'low',
        category: 'general',
        context: 'You are already making a difference'
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
