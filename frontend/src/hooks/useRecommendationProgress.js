import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Hook to calculate recommendation progress based on actual daily log data
 * Maps real user behavior to recommendation goals
 * 
 * Supports both:
 * - Option A: Hardcoded category-based tracking (for presets)
 * - Option B: Dynamic trackingConfig from recommendations (for AI-generated)
 */
export const useRecommendationProgress = (planItem, dailyLogs = []) => {
  const t = useTranslations('Plan');
  const locale = useLocale();

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
      return { percentage: 0, current: 0, target: 0, message: t('startLoggingToSee'), unit: t('days') };
    }

    // Option B: If recommendation has explicit trackingConfig, use it (for AI recommendations)
    if (planItem.trackingConfig) {
      const result = calculateDynamicProgress(planItem.trackingConfig, dailyLogs, t);
      console.log(`📊 Tracking [${planItem.title}]:`, {
        config: planItem.trackingConfig,
        logsCount: dailyLogs.length,
        result
      });
      return result;
    }

    // Option A: Fallback to hardcoded category-based tracking (for presets)
    const result = calculateCategoryBasedProgress(planItem.category, dailyLogs, t);
    console.log(`📊 Category-Based Tracking [${planItem.title}] (${planItem.category}):`, {
      logsCount: dailyLogs.length,
      result
    });
    return result;
  }, [planItem, dailyLogs, t, locale]);

  return progress;
};

/**
 * Option A: Hardcoded category-based tracking for presets
 */
function calculateCategoryBasedProgress(category, dailyLogs, t) {
  const allDays = dailyLogs;
  
  const monthlyGoals = {
    transport: 20,
    food: 8,
    energy: 20,
    waste: 28
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
        message: t('categoryDaysMessage', { current: vegetarianDays, target, type: t('vegetarianDays') }),
        unit: t('days')
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
        message: t('categoryDaysMessage', { current: lowEnergyDays, target, type: t('lowEnergyDays') }),
        unit: t('days')
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
        message: t('categoryDaysMessage', { current: publicTransitDays, target, type: t('ecoCommuteDays') }),
        unit: t('days')
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
        message: t('categoryDaysMessage', { current: segregatedDays, target, type: t('wasteSegregatedDays') }),
        unit: t('days')
      };
    }

    default:
      return { percentage: 0, current: 0, target: 0, message: t('noTracking'), unit: '' };
  }
}

/**
 * Helper: Get nested field value from object
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
 */
function calculateDynamicProgress(config, dailyLogs, t) {
  if (!config || !config.field) {
    return { percentage: 0, current: 0, target: 0, message: t('noTracking'), unit: '' };
  }

  const { field, value, goal, period = 'week', operator = '==' } = config;
  
  const maxLookback = period === 'month' ? 30 : 7;
  const lookbackDays = Math.min(dailyLogs.length, maxLookback);
  const logs = dailyLogs.slice(-lookbackDays);
  
  if (logs.length === 0) {
    return { percentage: 0, current: 0, target: goal || 1, message: t('startLoggingToSee'), unit: period === 'week' ? t('days') : t('kgPerMo') };
  }

  let current = 0;
  logs.forEach((log) => {
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

  const target = goal || 1;
  const percentage = Math.min((current / target) * 100, 100);
  const periodLabel = period === 'week' ? t('days') : t('kgPerMo');

  return {
    percentage,
    current,
    target,
    message: t('trackingMessage', { current, target, value, period: periodLabel }),
    unit: periodLabel
  };
}
