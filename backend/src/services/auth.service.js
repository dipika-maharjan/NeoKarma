/**
 * Auth Service
 * Handles user registration and login
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userRepository = require('../repositories/user.repository');
const config = require('../config/env');
const AppError = require('../utils/AppError');

class AuthService {
  /**
   * Register a new student
   */
  async registerStudent(userData) {
    const { name, email, password, grade, locationType, schoolName, extraProfile } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('This email is already registered', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await userRepository.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      grade,
      locationType,
      schoolName: schoolName || null,
      extraProfile: extraProfile || null,
      streak: {
        current: 0,
        longest: 0,
        lastLogDate: null,
        participationScore: 0
      }
    });

    // Return user without password and sign JWT
    const userObj = user.toObject();
    delete userObj.passwordHash;

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        grade: user.grade,
        locationType: user.locationType
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    return {
      user: userObj,
      token
    };
  }

  /**
   * Authenticate student and return JWT token
   */
  async loginStudent(email, password) {
    // Find user and include password hash
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        grade: user.grade,
        locationType: user.locationType
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    // Return token and user info (without password)
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return {
      token,
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
}

module.exports = new AuthService();
