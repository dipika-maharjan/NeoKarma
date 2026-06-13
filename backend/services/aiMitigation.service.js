const carbonLogRepository = require('../repositories/carbonLog.repository');
const mitigationRepository = require('../repositories/mitigation.repository');

class AIMitigationService {
  /**
   * Examines historical metrics to produce an actionable 1-month strategy plan
   */
  async generateOneMonthPlan(userId) {
    // Collect up to 30 days of data for the 1-Month Plan habit analysis
    const historicalLogs = await carbonLogRepository.getRecentLogs(userId, 30);
    
    if (!historicalLogs || historicalLogs.length < 1) {
      const error = new Error("Insufficient data points available. Keep logging to unlock your mitigation plan.");
      error.statusCode = 400;
      throw error;
    }

    // Initialize tracking buckets for specific categories
    let aggregateTotals = { transport: 0, food: 0, waste: 0, energy: 0 };
    let nonVegCount = 0;

    historicalLogs.forEach(log => {
      aggregateTotals.transport += log.emissions.transportCO2;
      aggregateTotals.food += log.emissions.foodCO2;
      aggregateTotals.waste += log.emissions.wasteCO2;
      aggregateTotals.energy += log.emissions.energyCO2;

      if (log.inputs.mealsServed === 'non-vegetarian') {
        nonVegCount++;
      }
    });

    const recommendations = [];

    // AI Logic Engine prioritizing specific urban school dynamics
    if (aggregateTotals.transport > 8) {
      recommendations.push({
        category: 'transport',
        title: 'Utilize your local School Bus Route lines',
        description: 'Swapping two single private car or motorbike drops for the combined school bus route directly limits Kathmandu corridor traffic emissions.',
        estimatedCO2ReductionKG: 3.2,
        effortLevel: 'Medium'
      });
    }

    if (nonVegCount > 12) {
      recommendations.push({
        category: 'food',
        title: 'Commit to Green Canteen Breaks',
        description: 'Substituting vegetarian or vegan dishes for your afternoon school canteen breaks curtails intensive livestock agricultural demands.',
        estimatedCO2ReductionKG: 1.8,
        effortLevel: 'Low'
      });
    }

    if (aggregateTotals.waste > 4) {
      recommendations.push({
        category: 'waste',
        title: 'Transition away from single-use plastics',
        description: 'Packing meals in reusable steel boxes prevents disposable plastic waste accumulations in open campus trash slots.',
        estimatedCO2ReductionKG: 1.2,
        effortLevel: 'Medium'
      });
    }

    // Default high-yield energy efficiency fallback option
    recommendations.push({
      category: 'energy',
      title: 'Form a Classroom Power-Down Monitor group',
      description: 'Designate student monitors to turn off smartboards, ceiling fans, and lights during recess or sports hours.',
      estimatedCO2ReductionKG: 0.8,
      effortLevel: 'Low'
    });

    // Deactivate previous roadmap plans to maintain a singular focus
    await mitigationRepository.deactivateOldPlans(userId);

    const completePlanData = {
      userId,
      durationDays: 30, // Locked strictly to the 1-month strategy blueprint
      recommendations,
      isActive: true
    };

    return await mitigationRepository.savePlan(completePlanData);
  }

  /**
   * Retrieve the student's currently active mitigation plan
   */
  async getActivePlan(userId) {
    const plan = await mitigationRepository.findActivePlan(userId);
    if (!plan) {
      return { message: "No active mitigation plan unlocked yet. Log consistently to get one." };
    }
    return plan;
  }
}

module.exports = new AIMitigationService();