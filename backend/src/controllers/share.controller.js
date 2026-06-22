/**
 * Share Controller
 * Handles shareable achievement profile generation and retrieval
 */
const shareRepository = require('../repositories/share.repository');
const userRepository = require('../repositories/user.repository');
const dailyLogRepository = require('../repositories/dailyLog.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

class ShareController {
  /**
   * POST /api/share/generate
   * Generate a shareable link for current user
   * Auth required (logged-in users only)
   */
  generateShare = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { customMessage } = req.body;

    // Validate custom message length
    if (customMessage && customMessage.length > 200) {
      throw new AppError('Custom message cannot exceed 200 characters', 400);
    }

    // Generate or get existing share
    const share = await shareRepository.generateOrGetShareId(userId);

    // Update custom message if provided
    if (customMessage) {
      share.customMessage = customMessage;
      await share.save();
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${share.shareId}`;

    res.status(200).json({
      success: true,
      message: 'Share link generated successfully',
      data: {
        shareId: share.shareId,
        shareUrl,
        createdAt: share.createdAt
      }
    });
  });

  /**
   * GET /api/share/:shareId
   * Retrieve public achievement profile
   * No auth required (public endpoint)
   */
  getPublicProfile = asyncHandler(async (req, res) => {
    const { shareId } = req.params;

    const share = await shareRepository.findByShareId(shareId);
    if (!share) {
      throw new AppError('Share not found or expired', 404);
    }

    const user = share.userId;
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Increment view count
    await shareRepository.incrementViewCount(shareId);

    // Get total logs and current streak
    const logsCount = await dailyLogRepository.countByUser(user._id);

    // Calculate trees equivalent using configured monthly absorption per tree
    // Trees are compared against mature tree monthly absorption (kg/year ÷ 12)
    const estimatedTotalCo2 = (logsCount * 2);
    const kgTreeYear = config.KG_CO2_PER_TREE_PER_YEAR || 21.77;
    const monthlyTreeAbsorptionKg = kgTreeYear / 12;
    const treesEquivalent = Math.round(estimatedTotalCo2 / monthlyTreeAbsorptionKg);

    // Format display name (first name + last initial)
    const nameParts = user.name ? user.name.split(' ') : ['User'];
    const displayName = nameParts.length >= 2
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

    // Extract joined month from createdAt
    const joinedDate = new Date(user.createdAt);
    const joinedMonth = joinedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    res.status(200).json({
      success: true,
      data: {
        displayName,
        joinedMonth,
        currentStreak: user.streak?.current || 0,
        longestStreak: user.streak?.longest || 0,
        totalLogsSubmitted: logsCount,
        treesEquivalent,
        estimatedTotalCo2Kg: Math.round(estimatedTotalCo2 * 10) / 10,
        participationScore: user.streak?.participationScore || 0,
        customMessage: share.customMessage || null,
        viewCount: share.viewCount,
        locationType: user.locationType, // 'urban' or 'rural'
        grade: user.grade
      }
    });
  });

  /**
   * DELETE /api/share/:shareId
   * Disable sharing (user clicked "stop sharing")
   * Auth required - user can only disable their own share
   */
  disableShare = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { shareId } = req.params;

    const share = await shareRepository.getActiveShareForUser(userId);
    if (!share || share.shareId !== shareId) {
      throw new AppError('Share not found or unauthorized', 404);
    }

    await shareRepository.deactivateShare(shareId);

    res.status(200).json({
      success: true,
      message: 'Share disabled successfully'
    });
  });
}

module.exports = new ShareController();
