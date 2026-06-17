/**
 * Mitigation Plan Service
 * Orchestrates plan generation using AI provider abstraction
 * Attempts external AI first, falls back to rule-based on failure
 * Aggregates 30 days of data and triggers generation
 */
const mitigationPlanRepository = require('../repositories/mitigationPlan.repository');
const dailyLogRepository = require('../repositories/dailyLog.repository');
const userRepository = require('../repositories/user.repository');
const externalAiProvider = require('./ai/externalAiProvider');
const fallbackRuleProvider = require('./ai/fallbackRuleProvider');
const { getDateNDaysAgo } = require('../utils/dateHelpers');
const AppError = require('../utils/AppError');

class MitigationPlanService {
  /**
   * Generate a 1-month mitigation plan for a user
   * Tries external AI first, falls back to rule-based provider on any failure
   */
  async generatePlanForUser(userId) {
    // Get user and recent logs
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get last 30 days of logs
    const logs = await dailyLogRepository.getRecentLogs(userId, 30);
    if (!logs || logs.length === 0) {
      throw new AppError('Insufficient data. Please log your activities for at least a few days.', 400);
    }

    // Calculate period dates
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = getDateNDaysAgo(30);

    // Aggregate 30-day data
    const aggregatedData = this.aggregateLogs(logs);

    let recommendations = [];
    let source = 'fallback-rule-based';

    // Try external AI provider first
    try {
      recommendations = await externalAiProvider.generateRecommendations(aggregatedData, user);
      source = 'external-ai';
      console.log(`✅ Plan generated using external AI provider`);
    } catch (aiError) {
      console.warn(`⚠️ External AI provider failed: ${aiError.message}. Falling back to rule-based...`);

      // Fall back to rule-based provider
      try {
        recommendations = await fallbackRuleProvider.generateRecommendations(aggregatedData, user);
        source = 'fallback-rule-based';
        console.log(`✅ Plan generated using fallback rule-based provider`);
      } catch (fallbackError) {
        throw new AppError(
          `Plan generation failed: ${fallbackError.message}`,
          500
        );
      }
    }

    // Deactivate old plans
    await mitigationPlanRepository.deactivateOldPlans(userId);

    // Create and save new plan
    const planData = {
      userId,
      periodStart: thirtyDaysAgo,
      periodEnd: today,
      baseEmissionKg: aggregatedData.totalEmissionKg,
      status: 'generated',
      source,
      recommendations,
      isActive: true
    };

    const savedPlan = await mitigationPlanRepository.create(planData);
    return savedPlan;
  }

  /**
   * Aggregate daily logs into summary data for plan generation
   */
  aggregateLogs(logs) {
    let totalEmissionKg = 0;
    let transportKg = 0;
    let foodKg = 0;
    let wasteKg = 0;
    let energyKg = 0;

    const dailyBreakdown = logs.map((log) => {
      totalEmissionKg += log.totalEmissionKg;
      transportKg += log.breakdown.transportKg;
      foodKg += log.breakdown.foodKg;
      wasteKg += log.breakdown.wasteKg;
      energyKg += log.breakdown.energyKg;

      return {
        date: log.date,
        transportation: log.transportation,
        food: log.food,
        wasteAndPlastic: log.wasteAndPlastic,
        energy: log.energy,
        totalEmissionKg: log.totalEmissionKg,
        breakdown: log.breakdown
      };
    });

    return {
      totalEmissionKg: parseFloat(totalEmissionKg.toFixed(3)),
      transportKg: parseFloat(transportKg.toFixed(3)),
      foodKg: parseFloat(foodKg.toFixed(3)),
      wasteKg: parseFloat(wasteKg.toFixed(3)),
      energyKg: parseFloat(energyKg.toFixed(3)),
      logsCount: logs.length,
      dailyBreakdown
    };
  }

  /**
   * Get the current active plan for a user
   */
  async getActivePlan(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const plan = await mitigationPlanRepository.findActivePlan(userId);
    if (!plan) {
      return null;
    }

    return plan;
  }

  /**
   * Get all plans for a user (for history)
   */
  async getUserPlans(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return await mitigationPlanRepository.findByUser(userId);
  }

  /**
   * Find users who need a new plan generated (at least 1 log, no active plan)
   * Called by scheduled job
   */
  async findUsersNeedingPlanGeneration() {
    const User = require('../models/User');
    const DailyLog = require('../models/DailyLog');

    const users = await User.find({});
    const needingUsers = [];
    
    for (const user of users) {
      const activePlan = await mitigationPlanRepository.findActivePlan(user._id);
      if (!activePlan) {
        const logsCount = await DailyLog.countDocuments({ userId: user._id });
        if (logsCount > 0) {
          needingUsers.push(user);
        }
      }
    }
    return needingUsers;
  }

  /**
   * Initialize daily scheduled cron job to run plan generation
   */
  startCronScheduler() {
    const cron = require('node-cron');
    
    // Run every day at midnight (0 0 * * *)
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ Running scheduled daily mitigation plan generation check...');
      try {
        const users = await this.findUsersNeedingPlanGeneration();
        let generatedCount = 0;
        for (const user of users) {
          try {
            await this.generatePlanForUser(user._id);
            generatedCount++;
          } catch (err) {
            console.error(`❌ Failed to automatically generate plan for user ${user._id}:`, err.message);
          }
        }
        console.log(`⏰ Scheduled mitigation plan generation check finished. Generated ${generatedCount} plans.`);
      } catch (err) {
        console.error('❌ Scheduled daily mitigation plan check failed:', err.message);
      }
    });
    
    console.log('🗓️ Mitigation plan cron scheduler initialized successfully.');
  }
}

module.exports = new MitigationPlanService();
