/**
 * Helper functions for date manipulation consistent across the app
 */

/**
 * Get today's date in YYYY-MM-DD format for Nepal timezone (UTC+5:45)
 */
const NEPAL_OFFSET_MINUTES = 5 * 60 + 45;

const dateToNepalYYYYMMDD = (date) => {
  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
  const nepalMs = utc + NEPAL_OFFSET_MINUTES * 60 * 1000;
  return new Date(nepalMs).toISOString().split('T')[0];
};

/**
 * Get today's date in YYYY-MM-DD format (Nepal local)
 */
const getTodayStr = () => dateToNepalYYYYMMDD(new Date());

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayStr = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return dateToNepalYYYYMMDD(d);
};

/**
 * Check if two dates are exactly 1 day apart (today vs yesterday)
 */
const isConsecutiveDays = (dateStr1, dateStr2) => {
  // Parse YYYY-MM-DD into UTC midnight then compare day difference
  const parseUTCDate = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const diffMs = parseUTCDate(dateStr2) - parseUTCDate(dateStr1);
  return diffMs === 24 * 60 * 60 * 1000;
};

/**
 * Get date N days ago in YYYY-MM-DD format
 */
const getDateNDaysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return dateToNepalYYYYMMDD(d);
};

/**
 * Get the start of a month (YYYY-MM-01)
 */
const getMonthStart = (dateStr) => {
  const [year, month] = dateStr.split('-');
  return `${year}-${month}-01`;
};

/**
 * Get the end of a month
 */
const getMonthEnd = (dateStr) => {
  const [year, month] = dateStr.split('-');
  const nextMonth = new Date(year, parseInt(month), 0);
  const offset = nextMonth.getTimezoneOffset();
  const targetDate = new Date(nextMonth.getTime() - offset * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
};

module.exports = {
  getTodayStr,
  getYesterdayStr,
  isConsecutiveDays,
  getDateNDaysAgo,
  getMonthStart,
  getMonthEnd
};
