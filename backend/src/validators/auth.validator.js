/**
 * Auth Validators
 * Validation for registration and login endpoints
 */
const { body, validationResult } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('grade')
    .isInt({ min: 8, max: 12 })
    .withMessage('Grade must be between 8 and 12'),

  body('locationType')
    .isIn(['urban', 'rural'])
    .withMessage('Location type must be "urban" or "rural"'),

  body('schoolName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('School name cannot exceed 200 characters')
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
];

const resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
