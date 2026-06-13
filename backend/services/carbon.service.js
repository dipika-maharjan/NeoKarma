const carbonLogRepository = require('../repositories/carbonLog.repository');
const userRepository = require('../repositories/user.repository');

// Localized contextual emission factors (kg CO2 per unit) derived from IPCC & Asian Transport Observatory
const EMISSION_FACTORS = {
  transport: { walk: 0, bicycle: 0, bus: 0.015, motorbike: 0.06, car: 0.18 }, // per KM
  food: { vegan: 0.4, vegetarian: 1.1, 'non-vegetarian': 2.8 },              // per Meal
  waste: 0.45,                                                               // per KG
  energy: 0.38                                                               // per KWh
};

// A mature local tree absorbs roughly 0.06 kg of CO2 per day (used for daily mirror reference)
const DAILY_TREE_ABSORPTION_KG = 0.06;

class CarbonService {
  /**
   * Helper function to perform localized calculations
   */
  calculateEmissions(inputs) {
    const transportCO2 = (EMISSION_FACTORS.transport[inputs.transportType] || 0) * (inputs.transportDistanceKM || 0);
    const foodCO2 = EMISSION_FACTORS.food[inputs.mealsServed] || 0;
    const wasteCO2 = (inputs.wasteGeneratedKG || 0) * EMISSION_FACTORS.waste;
    const energyCO2 = (inputs.energyUsageKWH || 0) * EMISSION_FACTORS.energy;

    return {
      transportCO2: parseFloat(transportCO2.toFixed(3)),
      foodCO2: parseFloat(foodCO2.toFixed(3)),
      wasteCO2: parseFloat(wasteCO2.toFixed(3)),
      energyCO2: parseFloat(energyCO2.toFixed(3)),
      totalCO2: parseFloat((transportCO2 + foodCO2 + wasteCO2 + energyCO2).toFixed(3))
    };
  }

  /**
   * Process and save a student's daily data input in under 60 seconds
   */
  async processDailyLog(userId, inputs) {
    // Generate explicit 'YYYY-MM-DD' stamp using local clock variables
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset();
    const targetDate = new Date(localDate.getTime() - (offset * 60 * 1000));
    const todayStr = targetDate.toISOString().split('T')[0];

    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Student profile record not found.');
      error.statusCode = 404;
      throw error;
    }

    const calculatedEmissions = this.calculateEmissions(inputs);
    let log = await carbonLogRepository.findByDate(userId, todayStr);

    if (log) {
      // Overwrite/update entries if a student updates variables on the same day
      log.inputs = inputs;
      log.emissions = calculatedEmissions;
      log = await carbonLogRepository.updateLog(log._id, log);
    } else {
      // Fresh unique daily log entry submission
      log = await carbonLogRepository.createLog({
        userId,
        date: todayStr,
        inputs,
        emissions: calculatedEmissions
      });
      // Advance streak count loop
      await this.updateUserStreak(user, todayStr);
    }

    // Build the visual story metadata for the Carbon Mirror
    const carbonMirror = this.generateCarbonMirror(calculatedEmissions.totalCO2);

    return { log, carbonMirror };
  }

  /**
   * Evaluates the active streak state variables
   */
  async updateUserStreak(user, todayStr) {
    const todayDateObj = new Date(todayStr);
    const yesterdayDateObj = new Date(todayDateObj);
    yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
    const yesterdayStr = yesterdayDateObj.toISOString().split('T')[0];

    let newStreak = user.streakCount;

    if (user.lastLoggedDate === yesterdayStr) {
      newStreak += 1; // Continuous streak maintained
    } else if (user.lastLoggedDate !== todayStr) {
      newStreak = 1;  // Streak broken, reset to 1
    }

    await userRepository.updateStreak(user._id, newStreak, todayStr);
  }

  /**
   * Translates numerical emissions into clear real-world imagery benchmarks
   */
  generateCarbonMirror(totalCO2) {
    const treesImpacted = (totalCO2 / DAILY_TREE_ABSORPTION_KG).toFixed(1);
    const parsingImpact = parseFloat(treesImpacted);

    // Contextual story mapping for students
    let visualMessage = '';
    let status = 'afforestation';

    if (parsingImpact >= 40) {
      visualMessage = `Your choices today map to the deforestation equivalent of cutting down ${parsingImpact} mature trees' daily filtration capacity.`;
      status = 'deforestation';
    } else if (parsingImpact > 15) {
      visualMessage = `Your daily footprint equals the daily carbon clearing load of removing ${parsingImpact} trees. Let's optimize your habits tomorrow!`;
      status = 'deforestation';
    } else {
      visualMessage = `Excellent work! Your baseline footprint is highly efficient and easily counterbalanced by a tiny cluster of ${parsingImpact} trees.`;
      status = 'afforestation';
    }

    return {
      visualMessage,
      treesCount: parsingImpact,
      status
    };
  }
}

// Export singleton instance
module.exports = new CarbonService();