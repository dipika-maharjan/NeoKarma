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

  return (
    <div className="flex-1">
      <ProgressTracker {...progress} />
    </div>
  );
};

export default ProgressTrackerWrapper;
