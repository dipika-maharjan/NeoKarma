/**
 * External AI Provider
 * Calls an external AI service (e.g., ML model or dedicated service)
 * with timeout handling and circuit breaker fallback
 */
const AIProviderInterface = require('./aiProvider.interface');
const config = require('../../config/env');
const AppError = require('../../utils/AppError');

class ExternalAIProvider extends AIProviderInterface {
  constructor() {
    super();
    this.timeout = parseInt(config.AI_SERVICE_TIMEOUT) || 8000;
  }

  /**
   * Call external AI service with timeout
   */
  async generateRecommendations(aggregatedData, userProfile) {
    if (!config.AI_SERVICE_URL) {
      throw new Error('AI_SERVICE_URL not configured');
    }

    try {
      const payload = {
        userId: userProfile._id,
        locationType: userProfile.locationType,
        grade: userProfile.grade,
        aggregatedEmissions: aggregatedData
      };

      // Set timeout promise race
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI service timeout')), this.timeout)
      );

      const fetch = require('node-fetch');
      const responsePromise = fetch(config.AI_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}`);
      }

      const result = await response.json();

      // Validate response has expected structure
      if (!Array.isArray(result.recommendations)) {
        throw new Error('Invalid response format from AI service');
      }

      return result.recommendations;
    } catch (error) {
      // Re-throw with context so caller can trigger fallback
      throw new Error(`External AI provider failed: ${error.message}`);
    }
  }

  getProviderInfo() {
    return {
      name: 'ExternalAIProvider',
      url: config.AI_SERVICE_URL,
      timeout: this.timeout,
      status: config.AI_SERVICE_URL ? 'configured' : 'not configured'
    };
  }
}

module.exports = new ExternalAIProvider();
