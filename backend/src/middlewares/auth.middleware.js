/**
 * Auth Middleware
 * JWT verification middleware for protected routes
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('No authorization token provided', 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

module.exports = authMiddleware;
