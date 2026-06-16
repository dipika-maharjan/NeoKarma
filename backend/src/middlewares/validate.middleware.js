/**
 * Validation Error Handler Middleware
 * Processes express-validator validation errors
 */
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.param}: ${e.msg}`);
    return next(new AppError(messages.join('; '), 400));
  }
  next();
};

module.exports = validateMiddleware;
