/**
 * Environment variable configuration
 * Loads .env and validates required keys
 */
require('dotenv').config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

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

  // CORS
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',

  // AI Service
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || null,
  AI_SERVICE_TIMEOUT: process.env.AI_SERVICE_TIMEOUT || 8000,

  // Carbon Metrics
  KG_CO2_PER_TREE_PER_YEAR: parseFloat(process.env.KG_CO2_PER_TREE_PER_YEAR) || 21, // Default: mature tree absorbs ~21kg/year
  DAILY_TREE_ABSORPTION_KG: parseFloat(process.env.KG_CO2_PER_TREE_PER_YEAR) / 365 || 0.0575
};
