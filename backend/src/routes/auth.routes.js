/**
 * Auth Routes
 */
const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/auth.validator');
const validateMiddleware = require('../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 requests per window
  message: 'Too many login attempts. Please try again later.'
});

/**
 * POST /api/auth/register
 */
router.post('/register', registerValidator, validateMiddleware, authController.signup);

/**
 * POST /api/auth/login
 */
router.post('/login', authLimiter, loginValidator, validateMiddleware, authController.login);

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validateMiddleware, authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', authLimiter, resetPasswordValidator, validateMiddleware, authController.resetPassword);

module.exports = router;
