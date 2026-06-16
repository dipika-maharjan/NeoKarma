/**
 * Helper functions for date manipulation consistent across the app
 */

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
const getTodayStr = () => {
  const localDate = new Date();
  const offset = localDate.getTimezoneOffset();
  const targetDate = new Date(localDate.getTime() - offset * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayStr = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const offset = yesterday.getTimezoneOffset();
  const targetDate = new Date(yesterday.getTime() - offset * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
};

/**
 * Check if two dates are exactly 1 day apart (today vs yesterday)
 */
const isConsecutiveDays = (dateStr1, dateStr2) => {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
};

/**
 * Get date N days ago in YYYY-MM-DD format
 */
const getDateNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const offset = d.getTimezoneOffset();
  const targetDate = new Date(d.getTime() - offset * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
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
