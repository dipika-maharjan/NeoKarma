/**
 * DailyLog Repository
 * All database operations related to DailyLog model
 */
const DailyLog = require('../models/DailyLog');

class DailyLogRepository {
  /**
   * Find a log by user and date
   */
  async findByUserAndDate(userId, date) {
    return await DailyLog.findOne({ userId, date });
  }

  /**
   * Create a new daily log
   */
  async create(logData) {
    const log = new DailyLog(logData);
    return await log.save();
  }

  /**
   * Update an existing log
   */
  async update(logId, updateData) {
    return await DailyLog.findByIdAndUpdate(logId, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Get recent logs for a user (default 30 days)
   * Returns sorted descending (newest first)
   */
  async getRecentLogs(userId, limit = 30) {
    return await DailyLog.find({ userId })
      .sort({ date: -1 })
      .limit(limit);
  }

  /**
   * Get logs within a date range
   */
  async getLogsByDateRange(userId, startDate, endDate) {
    return await DailyLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
  }

  /**
   * Get aggregate emissions for a date range
   */
  async getAggregateEmissions(userId, startDate, endDate) {
    return await DailyLog.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalEmissionKg: { $sum: '$totalEmissionKg' },
          transportKg: { $sum: '$breakdown.transportKg' },
          foodKg: { $sum: '$breakdown.foodKg' },
          wasteKg: { $sum: '$breakdown.wasteKg' },
          energyKg: { $sum: '$breakdown.energyKg' },
          logCount: { $sum: 1 }
        }
      }
    ]);
  }

  /**
   * Check if user has logged today
   */
  async hasLoggedToday(userId, today) {
    return await DailyLog.findOne({ userId, date: today });
  }

  /**
   * Count total logs for a user
   */
  async countByUser(userId) {
    return await DailyLog.countDocuments({ userId });
  }
}

module.exports = new DailyLogRepository();
