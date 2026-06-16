/**
 * MonthlySnapshot Repository
 * All database operations related to MonthlySnapshot model
 */
const MonthlySnapshot = require('../models/MonthlySnapshot');

class MonthlySnapshotRepository {
  /**
   * Find snapshot for user in specific month
   */
  async findByUserAndMonth(userId, month) {
    return await MonthlySnapshot.findOne({ userId, month });
  }

  /**
   * Get all snapshots for a user (for impact history)
   */
  async findByUser(userId) {
    return await MonthlySnapshot.find({ userId }).sort({ month: -1 });
  }

  /**
   * Create a new snapshot
   */
  async create(snapshotData) {
    const snapshot = new MonthlySnapshot(snapshotData);
    return await snapshot.save();
  }

  /**
   * Create or update snapshot (upsert)
   */
  async upsert(userId, month, updateData) {
    return await MonthlySnapshot.findOneAndUpdate(
      { userId, month },
      { ...updateData, userId, month },
      { new: true, upsert: true, runValidators: true }
    );
  }

  /**
   * Update a snapshot
   */
  async update(snapshotId, updateData) {
    return await MonthlySnapshot.findByIdAndUpdate(snapshotId, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Get last N months of snapshots
   */
  async getRecentMonths(userId, months = 12) {
    return await MonthlySnapshot.find({ userId })
      .sort({ month: -1 })
      .limit(months);
  }
}

module.exports = new MonthlySnapshotRepository();
