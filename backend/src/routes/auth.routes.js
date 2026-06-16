/**
 * Auth Routes
 */
const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validateMiddleware = require('../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
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

module.exports = router;
