import { useMemo } from 'react';

/**
 * Hook to calculate recommendation progress based on actual daily log data
 * Maps real user behavior to recommendation goals
 * 
 * Supports both:
 * - Option A: Hardcoded category-based tracking (for presets)
 * - Option B: Dynamic trackingConfig from recommendations (for AI-generated)
 */
export const useRecommendationProgress = (planItem, dailyLogs = []) => {
  const progress = useMemo(() => {
    // DEBUG: Log raw input to verify dailyLogs is being passed
    console.log(`🔍 useRecommendationProgress called for [${planItem?.title}]:`, {
      planItemCategory: planItem?.category,
      hasTrackingConfig: !!planItem?.trackingConfig,
      dailyLogsLength: dailyLogs.length,
      rawDailyLogs: dailyLogs  // Show actual structure
    });

    // Show tracking even with 1+ log entries (not 7+)
    if (!dailyLogs || dailyLogs.length === 0) {
      console.log(`⚠️ No daily logs available`);
      return { percentage: 0, current: 0, target: 0, message: 'Start logging to see progress', unit: 'days' };
    }

    // Option B: If recommendation has explicit trackingConfig, use it (for AI recommendations)
    if (planItem.trackingConfig) {
      const result = calculateDynamicProgress(planItem.trackingConfig, dailyLogs);
      console.log(`📊 Tracking [${planItem.title}]:`, {
        config: planItem.trackingConfig,
        logsCount: dailyLogs.length,
        result
      });
      return result;
    }

    // Option A: Fallback to hardcoded category-based tracking (for presets)
    const result = calculateCategoryBasedProgress(planItem.category, dailyLogs);
    console.log(`📊 Category-Based Tracking [${planItem.title}] (${planItem.category}):`, {
      logsCount: dailyLogs.length,
      result
    });
    return result;
  }, [planItem, dailyLogs]);

  return progress;
};

/**
 * Option A: Hardcoded category-based tracking for presets
 * Calculates progress based on MONTHLY goals, not daily/weekly
 * Monthly Goals:
 * - Transport: 20 days (5/week * 4 weeks)
 * - Food: 8 days (2/week * 4 weeks)
 * - Energy: 20 days (5/week * 4 weeks)
 * - Waste: 28 days (7/week * 4 weeks)
 */
function calculateCategoryBasedProgress(category, dailyLogs) {
  // Use ALL logs to count achieved days (not just last 7)
  const allDays = dailyLogs;
  
  // MONTHLY GOALS (full month targets)
  const monthlyGoals = {
    transport: 20,      // 5 eco days/week * 4 weeks
    food: 8,           // 2 vegetarian days/week * 4 weeks
    energy: 20,        // 5 low-energy days/week * 4 weeks
    waste: 28          // 7 segregated days/week * 4 weeks
  };

  switch (category) {
    case 'food': {
      const vegetarianDays = allDays.filter((log) => {
        const mealType = log.food?.mealType;
        return mealType === 'vegetarian' || mealType === 'vegan';
      }).length;
      const target = monthlyGoals.food;
      return {
        percentage: Math.min((vegetarianDays / target) * 100, 100),
        current: vegetarianDays,
        target,
        message: `${vegetarianDays} of ${target} vegetarian days this month`,
        unit: 'days'
      };
    }

    case 'energy': {
      const lowEnergyDays = allDays.filter((log) => {
        const energyHours = log.energy?.usageHours;
        return energyHours <= 2;
      }).length;
      const target = monthlyGoals.energy;
      return {
        percentage: Math.min((lowEnergyDays / target) * 100, 100),
        current: lowEnergyDays,
        target,
        message: `${lowEnergyDays} of ${target} low-energy days this month`,
        unit: 'days'
      };
    }

    case 'transport': {
      const publicTransitDays = allDays.filter((log) => {
        const mode = log.transportation?.mode;
        return mode === 'bus' || mode === 'walk' || mode === 'bicycle' || mode === 'public';
      }).length;
      const target = monthlyGoals.transport;
      return {
        percentage: Math.min((publicTransitDays / target) * 100, 100),
        current: publicTransitDays,
        target,
        message: `${publicTransitDays} of ${target} eco-friendly commute days this month`,
        unit: 'days'
      };
    }

    case 'waste': {
      const segregatedDays = allDays.filter((log) =>
        log.wasteAndPlastic?.segregated === true
      ).length;
      const target = monthlyGoals.waste;
      return {
        percentage: Math.min((segregatedDays / target) * 100, 100),
        current: segregatedDays,
        target,
        message: `${segregatedDays} of ${target} days with waste segregation this month`,
        unit: 'days'
      };
    }

    default:
      return { percentage: 0, current: 0, target: 0, message: 'No tracking available', unit: '' };
  }
}

/**
 * Helper: Get nested field value from object
 * Supports paths like "food.mealType" or "transportation.mode"
 */
function getFieldValue(obj, fieldPath) {
  if (!obj || !fieldPath) return undefined;
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    current = current?.[part];
    if (current === undefined) return undefined;
  }
  return current;
}

/**
 * Option B: Dynamic tracking using trackingConfig object
 * Works from day 1 by adapting targets based on available data
 * 
 * trackingConfig structure:
 * {
 *   field: string,           // Nested path like "food.mealType" or "transportation.mode"
 *   value: string|number,    // What value to look for (e.g., 'vegetarian', 'bus')
 *   goal: number,            // Target count for full period
 *   period: 'week'|'month',  // Tracking period
 *   operator?: '==', '>=', '<=', 'includes'  // Comparison operator (default: '==')
 * }
 */
function calculateDynamicProgress(config, dailyLogs) {
  if (!config || !config.field) {
    return { percentage: 0, current: 0, target: 0, message: 'Invalid tracking config', unit: '' };
  }

  const { field, value, goal, period = 'week', operator = '==' } = config;
  
  // Use all available logs up to the period (min 1, max 7 or 30)
  const maxLookback = period === 'month' ? 30 : 7;
  const lookbackDays = Math.min(dailyLogs.length, maxLookback);
  const logs = dailyLogs.slice(-lookbackDays);
  
  if (logs.length === 0) {
    return { percentage: 0, current: 0, target: goal || 1, message: 'Start logging to see progress', unit: period === 'week' ? 'days' : 'month' };
  }

  // Count matching entries based on operator
  let current = 0;
  logs.forEach((log) => {
    // Support nested paths like "food.mealType" or "transportation.mode"
    const logValue = getFieldValue(log, field);
    let matches = false;

    switch (operator) {
      case '==':
        matches = logValue === value;
        break;
      case '>=':
        matches = logValue >= value;
        break;
      case '<=':
        matches = logValue <= value;
        break;
      case 'includes':
        matches = Array.isArray(logValue) ? logValue.includes(value) : logValue?.includes?.(value);
        break;
      default:
        matches = logValue === value;
    }

    if (matches) current++;
  });

  // Adapt target proportionally for partial data (e.g., if only 3 days available out of 7)
  const adaptedTarget = lookbackDays < maxLookback 
    ? Math.ceil((goal / maxLookback) * lookbackDays) 
    : goal;
  
  const percentage = adaptedTarget > 0 ? Math.min((current / adaptedTarget) * 100, 100) : 0;
  const periodLabel = period === 'week' ? `${lookbackDays} days` : 'month';

  return {
    percentage,
    current,
    target: adaptedTarget,
    message: `${current} of ${adaptedTarget} "${value}" logs this ${periodLabel}`,
    unit: periodLabel
  };
}
