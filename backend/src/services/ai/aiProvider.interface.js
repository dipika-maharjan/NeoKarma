/**
 * AI Provider Interface
 * Defines the contract that all AI providers must implement
 * Allows swapping between external AI service and rule-based fallback
 */

class AIProviderInterface {
  /**
   * Generate mitigation recommendations for a user
   * 
   * @param {Object} aggregatedData - Last 30 days of aggregated emissions data
   * @param {number} aggregatedData.totalEmissionKg - Total kg CO2 for the period
   * @param {number} aggregatedData.transportKg - Total transport emissions
   * @param {number} aggregatedData.foodKg - Total food emissions
   * @param {number} aggregatedData.wasteKg - Total waste emissions
   * @param {number} aggregatedData.energyKg - Total energy emissions
   * @param {Array} aggregatedData.dailyBreakdown - Array of daily logs with inputs
   * @param {Object} userProfile - User information (grade, locationType, extraProfile, etc.)
   * 
   * @returns {Promise<Array>} Array of recommendations, each with:
   *   { text, description, estimatedReductionKg, effortLevel, category, context }
   * 
   * @throws {Error} If generation fails (will trigger fallback)
   */
  async generateRecommendations(aggregatedData, userProfile) {
    throw new Error('generateRecommendations() must be implemented by subclass');
  }

  /**
   * Optional: Get provider name and status
   */
  getProviderInfo() {
    throw new Error('getProviderInfo() must be implemented by subclass');
  }
}

module.exports = AIProviderInterface;
