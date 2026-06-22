/**
 * Mitigation Plan Service
 * Orchestrates plan generation using AI provider abstraction
 * Attempts external AI first, falls back to rule-based on failure
 * Aggregates 7 days of data and triggers generation
 */
const mitigationPlanRepository = require('../repositories/mitigationPlan.repository');
const dailyLogRepository = require('../repositories/dailyLog.repository');
const userRepository = require('../repositories/user.repository');
const externalAiProvider = require('./ai/externalAiProvider');
const fallbackRuleProvider = require('./ai/fallbackRuleProvider');
const { getDateNDaysAgo } = require('../utils/dateHelpers');
const AppError = require('../utils/AppError');

// Seeded random helper for consistent dummy data generation
function seededRandom(seedStr, offset = 0) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(offset, 2246822507);
  h ^= h >>> 13;
  return ((h >>> 0) / 4294967296);
}

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

    // Get last 30 days of logs for comprehensive analysis
    const logs = (await dailyLogRepository.getRecentLogs(userId, 30)) || [];

    // Calculate period dates
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = getDateNDaysAgo(30);

    // Aggregate 30-day data (real user logs only)
    const aggregatedData = this.prepareUserData(userId.toString(), logs);

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
   * Prepare user data by aggregating real daily logs.
   */
  prepareUserData(userIdStr, realLogs) {
    const combinedBreakdown = [];
    
    let transportKg = 0;
    let foodKg = 0;
    let wasteKg = 0;
    let energyKg = 0;

    // Add existing real logs to totals and the list
    for (const log of realLogs) {
      const tKg = log.breakdown?.transportKg || 0;
      const fKg = log.breakdown?.foodKg || 0;
      const wKg = log.breakdown?.wasteKg || 0;
      const eKg = log.breakdown?.energyKg || 0;

      transportKg += tKg;
      foodKg += fKg;
      wasteKg += wKg;
      energyKg += eKg;

      combinedBreakdown.push({
        date: log.date,
        transportation: log.transportation || { mode: 'walk', distanceKm: 0 },
        food: log.food || { mealType: 'vegetarian', foodWasteGrams: 0 },
        wasteAndPlastic: log.wasteAndPlastic || { plasticItemCount: 0, segregated: true },
        energy: log.energy || { usageHours: 0 },
        isDummyData: false,
        breakdown: {
          transportKg: tKg,
          foodKg: fKg,
          wasteKg: wKg,
          energyKg: eKg
        },
        totalEmissionKg: log.totalEmissionKg || (tKg + fKg + wKg + eKg)
      });
    }

    const totalEmissionKg = transportKg + foodKg + wasteKg + energyKg;

    return {
      totalEmissionKg: parseFloat(totalEmissionKg.toFixed(3)),
      transportKg: parseFloat(transportKg.toFixed(3)),
      foodKg: parseFloat(foodKg.toFixed(3)),
      wasteKg: parseFloat(wasteKg.toFixed(3)),
      energyKg: parseFloat(energyKg.toFixed(3)),
      logsCount: combinedBreakdown.length,
      realDataDays: realLogs.length,
      dummyDataDays: 0,
      dailyBreakdown: combinedBreakdown
    };
  }

  /**
   * Keep aggregateLogs for compatibility but direct to prepareUserData
   */
  aggregateLogs(logs) {
    return this.prepareUserData('generic_seed', logs);
  }

  /**
   * Check if user has enough activity logs
   */
  async hasEnoughData(userId, threshold = 7) {
    const logsCount = await dailyLogRepository.getLogsCount(userId);
    return logsCount >= threshold;
  }

  /**
   * Generate a default structured plan for cold-start users
   * CRITICAL: Must include dailyLogs for frontend tracking to work
   */
  generateGeneralPlan(logsCount) {
    // Fetch actual daily logs for frontend tracking
    // Note: In generateGeneralPlan, userId is not available, so we'll need to handle this differently
    // For now, return empty array - it will be populated in getOrGeneratePlan with userId
    
    return {
      type: 'GENERAL_PLAN',
      logsCount,
      dailyLogs: [],  // Will be populated with actual logs in getOrGeneratePlan
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
   * Structure weekly plan with aggregated insights
   */
  async structureMonthlyPlan(userId, plan, logsCount) {
    const logs = (await dailyLogRepository.getRecentLogs(userId, 30)) || [];
    const aggregatedData = this.prepareUserData(userId.toString(), logs);

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
      message: 'Here is your personalized AI-powered mitigation plan based on 30 days of your emission data.'
    };
  }

  /**
   * Get or generate the plan (auto routing based on threshold)
   * CRITICAL: Always includes dailyLogs for frontend progress tracking
   */
  async getOrGeneratePlan(userId) {
    const logsCount = await dailyLogRepository.getLogsCount(userId);
    
    // CRITICAL FIX: Always fetch logs to include in response for tracking
    const dailyLogs = (await dailyLogRepository.getRecentLogs(userId, 30)) || [];
    
    // Users need at least 30 days of emission data before AI recommendations kick in
    // Until then, show general (generic) recommendations
    if (logsCount < 30) {
      const planData = this.generateGeneralPlan(logsCount);
      // Add dailyLogs to response
      planData.dailyLogs = dailyLogs;
      return planData;
    }
    
    // 30+ logs: generate personalized AI-powered plan from user's actual data
    let plan = await mitigationPlanRepository.findActivePlan(userId);
    
    // If user has old GENERAL_PLAN, deactivate it and generate new MONTHLY_PLAN (upgrade path for old users)
    if (plan && plan.type === 'GENERAL_PLAN') {
      console.log(`📈 User ${userId} reached 30 logs: upgrading from GENERAL_PLAN to MONTHLY_PLAN`);
      await mitigationPlanRepository.deactivateOldPlans(userId);
      plan = null; // Force generation of new AI plan
    }
    
    if (!plan) {
      try {
        plan = await this.generatePlanForUser(userId);
      } catch (err) {
        console.error('Error auto-generating monthly plan:', err.message);
        const planData = this.generateGeneralPlan(logsCount);
        // Add dailyLogs to response even on error
        planData.dailyLogs = dailyLogs;
        return planData;
      }
    }

    const monthlyPlan = await this.structureMonthlyPlan(userId, plan, logsCount);
    // Add dailyLogs to monthly plan response
    monthlyPlan.dailyLogs = dailyLogs;
    return monthlyPlan;
  }

  /**
   * Force generate the plan (manually trigger generation)
   */
  async forceGeneratePlan(userId) {
    const logsCount = await dailyLogRepository.getLogsCount(userId);
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    for (const user of users) {
      const activePlan = await mitigationPlanRepository.findActivePlan(user._id);
      if (!activePlan || new Date(activePlan.generatedAt) < sevenDaysAgo) {
        const logsCount = await DailyLog.countDocuments({ userId: user._id });
        if (logsCount >= 7) {
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
