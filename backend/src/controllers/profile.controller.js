/**
 * Profile Controller
 * Handles user profile retrieval and updates
 */
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

class ProfileController {
  /**
   * GET /api/profile
   * Get current user's profile (auth required)
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  });

  /**
   * PATCH /api/profile
   * Update current user's profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { name, grade, locationType, schoolName, extraProfile } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;
    if (locationType !== undefined) updateData.locationType = locationType;
    if (schoolName !== undefined) updateData.schoolName = schoolName;
    if (extraProfile !== undefined) updateData.extraProfile = extraProfile;

    const user = await userRepository.update(userId, updateData);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  });
}

module.exports = new ProfileController();
