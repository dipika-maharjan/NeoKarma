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
    } catch (aiError) {
      console.warn(`⚠️ External AI provider failed: ${aiError.message}. Falling back to rule-based...`);

      // Fall back to rule-based provider
      try {
        recommendations = await fallbackRuleProvider.generateRecommendations(aggregatedData, user);
        source = 'fallback-rule-based';
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
   * Check if user has enough activity logs
   */
  async hasEnoughData(userId, threshold = 30) {
    const logsCount = await dailyLogRepository.getLogsCount(userId);
    return logsCount >= threshold;
  }

  /**
   * Generate a default structured plan for cold-start users
   */
  generateGeneralPlan(logsCount) {
    return {
      type: 'GENERAL_PLAN',
      logsCount,
      plan: {
        transport: [
          {
            text: 'Use Public Transport (Sajha Yatayat/Tempo)',
            description: 'Switch to electric safa tempos or public buses for commuting in Kathmandu or major towns. It reduces carbon footprint by up to 70% compared to private motorbikes/cars.',
            estimatedReductionKg: 35.0,
            effortLevel: 'medium',
            category: 'transportation'
          },
          {
            text: 'Walk or Cycle for Short Trips',
            description: 'For distances under 2 km (e.g., local market trips), walk or ride a bicycle. Helps keep Nepali air cleaner and stays healthy.',
            estimatedReductionKg: 15.0,
            effortLevel: 'low',
            category: 'transportation'
          }
        ],
        energy: [
          {
            text: 'Unplug Unused Chargers & Appliances',
            description: 'Phantom power is a significant issue. Turn off the switch for mobile chargers and laptops when not charging, especially at home and school.',
            estimatedReductionKg: 10.0,
            effortLevel: 'low',
            category: 'energy'
          },
          {
            text: 'Maximize Natural Daylight',
            description: 'Open curtains and study near windows during the day to avoid using tube lights. Nepal gets excellent sunshine year-round.',
            estimatedReductionKg: 8.0,
            effortLevel: 'low',
            category: 'energy'
          }
        ],
        diet: [
          {
            text: 'Eat Local, Seasonal Produce',
            description: 'Buy local fruits and vegetables (like local apples from Mustang or green vegetables from Dhading) instead of imported items. Reduces transport emissions.',
            estimatedReductionKg: 20.0,
            effortLevel: 'low',
            category: 'food'
          },
          {
            text: 'Introduce a Meat-Free Day',
            description: 'Commit to Dal Bhat Tarkari with no meat (completely vegetarian) at least 3 days a week. Meat production has a much higher carbon footprint.',
            estimatedReductionKg: 25.0,
            effortLevel: 'medium',
            category: 'food'
          }
        ],
        waste: [
          {
            text: 'Say No to Single-Use Plastic Bags',
            description: 'Carry a reusable cloth bag (Jhola) for grocery shopping. Plastic pollution is a major environmental challenge in Nepal.',
            estimatedReductionKg: 12.0,
            effortLevel: 'low',
            category: 'waste'
          },
          {
            text: 'Compost Biodegradable Waste',
            description: 'Separate organic kitchen waste (vegetable peels, leftovers) and compost them for home gardening/plants instead of sending to landfill.',
            estimatedReductionKg: 18.0,
            effortLevel: 'medium',
            category: 'waste'
          }
        ]
      },
      message: 'Keep logging daily activities to unlock personalized monthly insights.'
    };
  }

  /**
   * Structure monthly plan with aggregated insights
   */
  async structureMonthlyPlan(userId, plan, logsCount) {
    const logs = await dailyLogRepository.getRecentLogs(userId, 30);
    const aggregatedData = this.aggregateLogs(logs);

    const contributors = [
      { category: 'transport', emission: aggregatedData.transportKg, label: 'Transportation' },
      { category: 'food', emission: aggregatedData.foodKg, label: 'Food & Diet' },
      { category: 'energy', emission: aggregatedData.energyKg, label: 'Energy Usage' },
      { category: 'waste', emission: aggregatedData.wasteKg, label: 'Waste & Plastics' }
    ];
    
    contributors.sort((a, b) => b.emission - a.emission);

    const topContributors = contributors.map(c => ({
      category: c.category,
      label: c.label,
      emissionKg: parseFloat(c.emission.toFixed(1)),
      percentage: aggregatedData.totalEmissionKg > 0 
        ? Math.round((c.emission / aggregatedData.totalEmissionKg) * 100) 
        : 0
    }));

    return {
      type: 'MONTHLY_PLAN',
      logsCount,
      plan: {
        topContributors,
        recommendations: plan ? (plan.recommendations || []) : []
      },
      message: 'Here is your personalized monthly mitigation plan based on your highest emission contributors.'
    };
  }

  /**
   * Get or generate the plan (auto routing based on threshold)
   */
  async getOrGeneratePlan(userId) {
    const logsCount = await dailyLogRepository.getLogsCount(userId);
    const hasEnough = logsCount >= 30;

    if (!hasEnough) {
      return this.generateGeneralPlan(logsCount);
    }

    let plan = await mitigationPlanRepository.findActivePlan(userId);
    if (!plan) {
      try {
        plan = await this.generatePlanForUser(userId);
      } catch (err) {
        console.error('Error auto-generating monthly plan:', err.message);
        return this.generateGeneralPlan(logsCount);
      }
    }

    return this.structureMonthlyPlan(userId, plan, logsCount);
  }

  /**
   * Force generate the plan (manually trigger generation)
   */
  async forceGeneratePlan(userId) {
    const logsCount = await dailyLogRepository.getLogsCount(userId);
    const hasEnough = logsCount >= 30;

    if (!hasEnough) {
      return this.generateGeneralPlan(logsCount);
    }

    const plan = await this.generatePlanForUser(userId);
    return this.structureMonthlyPlan(userId, plan, logsCount);
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
        // Scheduled mitigation plan generation finished
      } catch (err) {
        console.error('❌ Scheduled daily mitigation plan check failed:', err.message);
      }
    });
    
  }
}

module.exports = new MitigationPlanService();
