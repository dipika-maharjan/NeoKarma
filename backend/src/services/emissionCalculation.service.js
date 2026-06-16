/**
 * Emission Calculation Service
 * Computes CO2 emissions from raw inputs using configurable emission factors
 * Never hardcodes factor values - always reads from EmissionFactor collection
 */
const emissionFactorRepository = require('../repositories/emissionFactor.repository');
const AppError = require('../utils/AppError');

class EmissionCalculationService {
  /**
   * Calculate emissions for a single daily log
   * Returns breakdown by category and total
   */
  async calculateEmissions(inputs) {
    const {
      transportationMode,
      transportationDistanceKm,
      foodMealType,
      wasteAndPlasticCount,
      energyUsageHours
    } = inputs;

    let breakdown = {
      transportKg: 0,
      foodKg: 0,
      wasteKg: 0,
      energyKg: 0
    };

    // Transportation emissions
    const transportFactor = await emissionFactorRepository.findActive('transportation', transportationMode);
    if (!transportFactor) {
      throw new AppError(`No emission factor found for transportation mode: ${transportationMode}`, 500);
    }
    breakdown.transportKg = parseFloat(
      (transportFactor.factorValue * transportationDistanceKm).toFixed(3)
    );

    // Food emissions
    const foodFactor = await emissionFactorRepository.findActive('food', foodMealType);
    if (!foodFactor) {
      throw new AppError(`No emission factor found for meal type: ${foodMealType}`, 500);
    }
    breakdown.foodKg = parseFloat(foodFactor.factorValue.toFixed(3));

    // Waste emissions
    const wasteFactor = await emissionFactorRepository.findActive('waste', 'plastic');
    if (!wasteFactor) {
      throw new AppError('No emission factor found for waste', 500);
    }
    breakdown.wasteKg = parseFloat(
      (wasteFactor.factorValue * wasteAndPlasticCount).toFixed(3)
    );

    // Energy emissions
    const energyFactor = await emissionFactorRepository.findActive('energy', 'electricity');
    if (!energyFactor) {
      throw new AppError('No emission factor found for energy', 500);
    }
    breakdown.energyKg = parseFloat(
      (energyFactor.factorValue * energyUsageHours).toFixed(3)
    );

    // Total
    const totalEmissionKg = parseFloat(
      (breakdown.transportKg + breakdown.foodKg + breakdown.wasteKg + breakdown.energyKg).toFixed(3)
    );

    return {
      breakdown,
      totalEmissionKg
    };
  }

  /**
   * Get all active emission factors (for debugging/transparency)
   */
  async getAllFactors() {
    return await emissionFactorRepository.findAllActive();
  }
}

module.exports = new EmissionCalculationService();
