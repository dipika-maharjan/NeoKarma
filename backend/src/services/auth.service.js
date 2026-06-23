/**
 * Auth Service
 * Handles user registration and login
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const User = require('../models/User');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');

class AuthService {
  /**
   * Register a new student
   */
  async registerStudent(userData) {
    const { name, email, password, grade, section, locationType, schoolName, extraProfile } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('This email is already registered', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // schoolName is optional free-text — no validation against school_admin records
    // Create user
    const user = await userRepository.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      grade,
      section,
      locationType,
      schoolName: schoolName ? schoolName.trim() : null,
      schoolId: null,
      extraProfile: extraProfile || null,
      role: 'student',
      streak: {
        current: 0,
        longest: 0,
        lastLogDate: null,
        participationScore: 0
      },
      practicalMarks: {
        currentStreak: 0,
        longestStreak: 0,
        totalLogDays: 0,
        marksAwarded: 0,
        lastSyncedAt: null
      }
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || null,
        grade: user.grade,
        locationType: user.locationType
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    return {
      user: userObj,
      token,
      role: user.role
    };
  }

  /**
   * Authenticate student and return JWT token
   */
  async loginStudent(email, password) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || null,
        grade: user.grade,
        locationType: user.locationType
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return {
      token,
      role: user.role,
      user: userObj
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Request password reset token and send email
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('No user found with that email address', 404);
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set expires
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Save fields on user
    user.resetPasswordToken = passwordResetToken;
    user.resetPasswordExpires = passwordResetExpires;
    await user.save();

    // Construct reset URL
    const resetUrl = `${config.FRONTEND_ORIGIN}/reset-password?token=${resetToken}`;

    // HTML message template
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9eefb; border-radius: 8px; background-color: #f8f9ff;">
        <h2 style="color: #0A3D25; text-align: center; margin-bottom: 24px;">Neoकर्म Password Reset</h2>
        <p style="font-size: 14px; color: #303542; line-height: 1.5;">Hello ${user.name},</p>
        <p style="font-size: 14px; color: #303542; line-height: 1.5;">You requested a password reset for your Neoकर्म account. Click the button below to reset your password. This link is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0A3D25; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;">Reset Password</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #cfd7df; margin: 20px 0;" />
        <p style="font-size: 11px; color: #68706d; text-align: center; line-height: 1.5;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Neoकर्म Password Reset Link',
        message: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
        html: htmlMessage
      });
    } catch (err) {
      // Clean up token/expires if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw new AppError('There was an error sending the email. Try again later.', 500);
    }

    return true;
  }

  /**
   * Reset user password using token
   */
  async resetPassword(token, newPassword) {
    // Hash token to match database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with token and valid expiration date
    const user = await userRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new AppError('Password reset link is invalid or has expired', 400);
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Clear reset token and expiration
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
