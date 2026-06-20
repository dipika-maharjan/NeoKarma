/**
 * Daily Log Validators
 * Validation for daily log submission
 */
const { body, validationResult } = require('express-validator');

const submitLogValidator = [
  body('transportationMode')
    .isIn(['walk', 'bicycle', 'bus', 'motorbike', 'car'])
    .withMessage('Transportation mode must be one of: walk, bicycle, bus, motorbike, car'),

  body('transportationDistanceKm')
    .isFloat({ min: 0 })
    .withMessage('Distance must be a non-negative number'),

  body('foodMealType')
    .isIn(['vegetarian', 'mixed', 'non-vegetarian', 'vegan'])
    .withMessage('Meal type must be one of: vegetarian, mixed, non-vegetarian, vegan'),

  body('wasteAndPlasticCount')
    .isInt({ min: 0 })
    .withMessage('Plastic item count must be a non-negative integer'),

  body('date')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Date must be a valid ISO date in YYYY-MM-DD format')
    .bail()
    .custom((value) => {
      // value is YYYY-MM-DD
      const { getTodayStr, getDateNDaysAgo } = require('../utils/dateHelpers');
      const today = getTodayStr();
      const minDate = getDateNDaysAgo(60); // don't allow logs older than 60 days
      if (value > today) {
        throw new Error('Date cannot be in the future');
      }
      if (value < minDate) {
        throw new Error('Date is too old (older than 60 days)');
      }
      return true;
    }),

  body('energyUsageHours')
    .isFloat({ min: 0 })
    .withMessage('Energy usage must be a non-negative number'),

  body('extraAnswer')
    .optional()
    .isObject()
    .withMessage('Extra answer must be an object')
];

module.exports = {
  submitLogValidator
};
