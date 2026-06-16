/**
 * Streak Service
 * Manages daily streak tracking and participation score
 * Streak: unbroken chain of daily logs
 * Participation Score: cumulative points for consistency (never penalizes high emissions)
 */
const userRepository = require('../repositories/user.repository');
const { getTodayStr, getYesterdayStr, isConsecutiveDays } = require('../utils/dateHelpers');
const AppError = require('../utils/AppError');

class StreakService {
  /**
   * Update streak after a new log is created
   * Called when DailyLog is successfully saved
   */
  async updateStreakAfterLogCreation(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    let newCurrent = user.streak.current;
    let newLongest = user.streak.longest;

    if (user.streak.lastLogDate === yesterday) {
      // Streak continues - logged yesterday and today
      newCurrent += 1;
    } else if (user.streak.lastLogDate === today) {
      // Already logged today (resubmission), don't change streak
      newCurrent = user.streak.current;
    } else {
      // Streak broken - reset to 1
      newCurrent = 1;
    }

    // Update longest if current exceeds it
    if (newCurrent > newLongest) {
      newLongest = newCurrent;
    }

    // Always increment participation score for any valid log
    // (rewards consistency and honesty, not low emissions)
    const newParticipationScore = user.streak.participationScore + 1;

    const updatedStreak = {
      current: newCurrent,
      longest: newLongest,
      lastLogDate: today,
      participationScore: newParticipationScore
    };

    return await userRepository.updateStreak(userId, updatedStreak);
  }

  /**
   * Get current streak info for a user
   */
  async getStreak(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.streak;
  }
}

module.exports = new StreakService();
