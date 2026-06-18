/**
 * Pure streak-to-marks conversion rule:
 * 1 mark per 5 consecutive days, capped at 20.
 * This keeps the formula easy to explain during demos.
 */
const streakToMarks = ({ currentStreak = 0, longestStreak = 0, totalLogDays = 0 }) => {
  const safeCurrent = Math.max(0, Number(currentStreak) || 0);
  const safeLongest = Math.max(0, Number(longestStreak) || 0);
  const safeTotal = Math.max(0, Number(totalLogDays) || 0);

  const baseMarks = Math.floor(safeCurrent / 5);
  const longestMarks = Math.floor(safeLongest / 5);
  const totalMarks = Math.floor(safeTotal / 5);

  const marksAwarded = Math.min(20, Math.max(baseMarks, longestMarks, totalMarks));

  return {
    marksAwarded,
    currentStreak: safeCurrent,
    longestStreak: safeLongest,
    totalLogDays: safeTotal,
    formula: 'floor(streak / 5) capped at 20'
  };
};

module.exports = streakToMarks;
