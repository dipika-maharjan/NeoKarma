import { submitDailyLog, fetchTodayLog, fetchDailyLogHistory } from '../api/calculatorApi';
import { savePendingLog } from '@/lib/offline/db';

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

// Use Nepal local date (UTC+5:45) for all client-side date tagging
const getNepalDateStr = (d = new Date()) => {
  const utc = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds()
  );
  const nepalOffsetMinutes = 5 * 60 + 45; // +5:45
  const nepalMs = utc + nepalOffsetMinutes * 60 * 1000;
  return new Date(nepalMs).toISOString().slice(0, 10);
};

export const logDailyCarbon = async (payload, locale = 'en') => {
  // Attach a date (Nepal local) so server can upsert on (userId, date)
  const todayStr = getNepalDateStr();
  const payloadWithDate = { ...payload, date: payload.date || todayStr };

  if (typeof window !== 'undefined' && !navigator.onLine) {
    // Offline: save locally and notify UI
    await savePendingLog(payloadWithDate);
    try { window.dispatchEvent(new CustomEvent('offline-saved', { detail: { date: payloadWithDate.date } })); } catch (e) {}
    return null;
  }

  try {
    const response = await submitDailyLog(payloadWithDate, locale);
    // Cache the updated streak if available
    if (response.data?.data?.updatedStreak) {
      cacheStreakData(response.data.data.updatedStreak);
    }
    return response.data;
  } catch (err) {
    // Network failed while claiming to be online: fallback to local save
    await savePendingLog(payloadWithDate);
    try { window.dispatchEvent(new CustomEvent('offline-saved', { detail: { date: payloadWithDate.date } })); } catch (e) {}
    return null;
  }
};

export const getTodayLog = async () => {
  const response = await fetchTodayLog();
  return response.data?.data || null;
};

export const getDailyLogHistory = async (params = {}) => {
  const response = await fetchDailyLogHistory(params);
  return response.data;
};
