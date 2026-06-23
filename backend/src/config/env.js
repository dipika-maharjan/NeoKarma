/**
 * Environment variable configuration
 * Loads .env and validates required keys
 */
require('dotenv').config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  // Database
  MONGO_URI: process.env.MONGO_URI,

  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Auth
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // CORS
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',

  // AI Service
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || null,
  AI_SERVICE_TIMEOUT: process.env.AI_SERVICE_TIMEOUT || 8000,

  // Carbon Metrics
  // Base value (kg CO2 absorbed per mature tree per year). Default to 21.77 kg/year per USDA Forest Service.
  KG_CO2_PER_TREE_PER_YEAR: parseFloat(process.env.KG_CO2_PER_TREE_PER_YEAR) || 21.77,
  // Derived metrics: daily and monthly absorption based on the annual value.
  DAILY_TREE_ABSORPTION_KG: (parseFloat(process.env.KG_CO2_PER_TREE_PER_YEAR) || 21.77) / 365,
  MONTHLY_TREE_ABSORPTION_KG: (parseFloat(process.env.KG_CO2_PER_TREE_PER_YEAR) || 21.77) / 12,
  IMPACT_SCORE_GOAL: parseInt(process.env.IMPACT_SCORE_GOAL, 10) || 94,

  // Score Calculation Weights
  SCORE_STREAK_MULTIPLIER: parseFloat(process.env.SCORE_STREAK_MULTIPLIER) || 5,
  SCORE_STREAK_MAX_POINTS: parseInt(process.env.SCORE_STREAK_MAX_POINTS, 10) || 25,
  SCORE_CONSISTENCY_MULTIPLIER: parseFloat(process.env.SCORE_CONSISTENCY_MULTIPLIER) || 2.5,
  SCORE_CONSISTENCY_MAX_POINTS: parseInt(process.env.SCORE_CONSISTENCY_MAX_POINTS, 10) || 25,
  SCORE_ACTIONS_WEIGHT: parseInt(process.env.SCORE_ACTIONS_WEIGHT, 10) || 35,
  SCORE_ACTIONS_DEFAULT_POINTS: parseInt(process.env.SCORE_ACTIONS_DEFAULT_POINTS, 10) || 15,
  SCORE_COMPLETENESS_THRESHOLD: parseInt(process.env.SCORE_COMPLETENESS_THRESHOLD, 10) || 3,
  SCORE_COMPLETENESS_HIGH_POINTS: parseInt(process.env.SCORE_COMPLETENESS_HIGH_POINTS, 10) || 15,
  SCORE_COMPLETENESS_LOW_MULTIPLIER: parseFloat(process.env.SCORE_COMPLETENESS_LOW_MULTIPLIER) || 5,
  SCORE_COMPLETENESS_LOW_MAX_POINTS: parseInt(process.env.SCORE_COMPLETENESS_LOW_MAX_POINTS, 10) || 15,
  SCORE_OVERALL_MAX: parseInt(process.env.SCORE_OVERALL_MAX, 10) || 100,
  SCORE_IMPACT_DROP_DEFAULT: parseInt(process.env.SCORE_IMPACT_DROP_DEFAULT, 10) || 17,
  SCORE_GOLD_THRESHOLD: parseInt(process.env.SCORE_GOLD_THRESHOLD, 10) || 800,
  SCORE_SILVER_THRESHOLD: parseInt(process.env.SCORE_SILVER_THRESHOLD, 10) || 600,
  SCORE_PDF_POINTS_PER_LOG: parseInt(process.env.SCORE_PDF_POINTS_PER_LOG, 10) || 10
};
