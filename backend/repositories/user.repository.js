const User = require('../models/User');

class UserRepository {
  /**
   * Find a student profile by their unique MongoDB ObjectId
   */
  async findById(userId) {
    return await User.findById(userId);
  }

  /**
   * Find a student profile by email address (useful for authentication/login)
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Safely update the student's daily streak metrics and record their logging date
   */
  async updateStreak(userId, streakCount, lastLoggedDate) {
    return await User.findByIdAndUpdate(
      userId,
      { streakCount, lastLoggedDate },
      { new: true, runValidators: true }
    );
  }

  /**
   * Create a new student user profile during registration
   */
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }
}

module.exports = new UserRepository();