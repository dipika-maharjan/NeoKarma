/**
 * Auth Controller
 * Handles registration and login endpoints
 * Delegates all business logic to auth.service
 */
const authService = require('../services/auth.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  /**
   * POST /api/auth/register
   */
  signup = asyncHandler(async (req, res) => {
    const { name, email, password, grade, section, locationType, schoolName, extraProfile } = req.body;

    // Validation
    if (!name || !email || !password || !grade || !locationType) {
      throw new AppError('Missing required fields: name, email, password, grade, locationType', 400);
    }

    const result = await authService.registerStudent({
      name,
      email,
      password,
      grade,
      section,
      locationType,
      schoolName,
      extraProfile
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: result
    });
  });

  /**
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await authService.loginStudent(email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('role', result.role, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  });

  /**
   * POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Token and password are required', 400);
    }

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login.'
    });
  });
}

module.exports = new AuthController();
