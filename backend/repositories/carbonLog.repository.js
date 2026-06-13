const CarbonLog = require('../models/CarbonLog');

class CarbonLogRepository {
  /**
   * Find a carbon entry for a specific user on a specific calendar day ('YYYY-MM-DD')
   */
  async findByDate(userId, date) {
    return await CarbonLog.findOne({ userId, date });
  }

  /**
   * Create a completely fresh daily footprint submission
   */
  async createLog(logData) {
    const log = new CarbonLog(logData);
    return await log.save();
  }

  /**
   * Overwrite/update entries if a student resubmits their variables on the same day
   */
  async updateLog(id, updatedData) {
    return await CarbonLog.findByIdAndUpdate(
      id, 
      updatedData, 
      { new: true, runValidators: true }
    );
  }

  /**
   * Fetches data up to a limit (defaulting to 30 days for Neoकर्म's 1-Month habit loop)
   * Sorted descending (-1) to look from today backwards
   */
  async getRecentLogs(userId, limit = 30) {
    return await CarbonLog.find({ userId })
      .sort({ date: -1 })
      .limit(limit);
  }
}

module.exports = new CarbonLogRepository();