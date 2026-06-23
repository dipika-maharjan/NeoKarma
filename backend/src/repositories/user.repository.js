/**
 * User Repository
 * All database operations related to User model
 */
const User = require('../models/User');

class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId) {
    return await User.findById(userId);
  }

  /**
   * Find user by email (used for login)
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Create a new user
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Update user profile
   */
  async update(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Update streak metrics
   */
  async updateStreak(userId, streakUpdate) {
    return await User.findByIdAndUpdate(
      userId,
      { streak: streakUpdate },
      { new: true, runValidators: true }
    );
  }

  /**
   * Get user with streak info
   */
  async findWithStreak(userId) {
    return await User.findById(userId).select('+streak');
  }

  /**
   * Find user by email and include password (for login verification)
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  }

  /**
   * Find user by password reset token and ensure it has not expired
   */
  async findByResetToken(hashedToken) {
    return await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }
}

module.exports = new UserRepository();
