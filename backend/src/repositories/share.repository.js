/**
 * Share Repository
 * Data access layer for Share model
 */
const Share = require('../models/Share');

class ShareRepository {
  /**
   * Generate or retrieve existing share ID for user
   * Deactivates old shares and creates/returns a new one
   */
  async generateOrGetShareId(userId) {
    // Deactivate all existing active shares
    await Share.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create new share
    const share = await Share.create({
      userId,
      isActive: true
    });

    return share;
  }

  /**
   * Find share by shareId (public endpoint, no auth needed)
   */
  async findByShareId(shareId) {
    return await Share.findOne({ shareId, isActive: true })
      .populate('userId', 'name email grade locationType streak createdAt');
  }

  /**
   * Get active share for user
   */
  async getActiveShareForUser(userId) {
    return await Share.findOne({ userId, isActive: true });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(shareId) {
    return await Share.findOneAndUpdate(
      { shareId },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  /**
   * Deactivate share (user disables sharing)
   */
  async deactivateShare(shareId) {
    return await Share.findOneAndUpdate(
      { shareId },
      { isActive: false },
      { new: true }
    );
  }
}

module.exports = new ShareRepository();
