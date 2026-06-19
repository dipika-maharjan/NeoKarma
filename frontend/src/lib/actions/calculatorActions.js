import { submitDailyLog, fetchTodayLog, fetchDailyLogHistory } from '../api/calculatorApi';

const STREAK_CACHE_KEY = 'neokarma_streak_cache';
const STREAK_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
export const STREAK_UPDATED_EVENT = 'neokarma-streak-updated';

// Helper to cache streak data
const cacheStreakData = (streak) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STREAK_CACHE_KEY,
      JSON.stringify({
        data: streak,
        timestamp: Date.now()
      })
    );
    window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT, { detail: streak }));
  }
};

// Helper to get cached streak (if not stale)
export const getCachedStreak = () => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(STREAK_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    if (age > STREAK_CACHE_TTL) {
      localStorage.removeItem(STREAK_CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch (e) {
    return null;
  }
};

export const logDailyCarbon = async (payload) => {
  const response = await submitDailyLog(payload);
  // Cache the updated streak if available
  if (response.data?.data?.updatedStreak) {
    cacheStreakData(response.data.data.updatedStreak);
  }
  return response.data;
};

export const getTodayLog = async () => {
  const response = await fetchTodayLog();
  return response.data?.data || null;
};

export const getDailyLogHistory = async (params = {}) => {
  const response = await fetchDailyLogHistory(params);
  return response.data;
};
