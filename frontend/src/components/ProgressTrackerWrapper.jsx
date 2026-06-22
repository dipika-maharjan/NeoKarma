import { useRecommendationProgress } from '@/hooks/useRecommendationProgress';
import ProgressTracker from './ProgressTracker';

/**
 * Wrapper component for progress tracker that integrates with plan item
 * Handles both:
 * - Option A: Hardcoded category-based tracking (for GENERAL_PLAN presets)
 * - Option B: Dynamic trackingConfig tracking (for AI-generated or configured presets)
 */
export const ProgressTrackerWrapper = ({ item, dailyLogs }) => {
  const progress = useRecommendationProgress(item, dailyLogs);

  // Debug log ALWAYS to see what's happening
  console.log(`🎯 ProgressTrackerWrapper [${item?.title}]:`, {
    hasItem: !!item,
    itemId: item?.id,
    itemCategory: item?.category,
    itemTrackingConfig: item?.trackingConfig,
    dailyLogsReceived: dailyLogs?.length || 0,
    progressResult: progress,
    itemStructure: item  // Show full item structure
  });

  return (
    <div className="flex-1">
      <ProgressTracker {...progress} />
    </div>
  );
};

export default ProgressTrackerWrapper;
