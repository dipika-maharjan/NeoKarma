/**
 * Main Router
 * Mounts all individual route modules
 */
const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const dailyLogRoutes = require('./dailyLog.routes');
const dashboardRoutes = require('./dashboard.routes');
const carbonMirrorRoutes = require('./carbonMirror.routes');
const mitigationPlanRoutes = require('./mitigationPlan.routes');
const streakRoutes = require('./streak.routes');
const emissionFactorsRoutes = require('./emissionFactors.routes');
const adminRoutes = require('./admin.routes');
const asyncHandler = require('../utils/asyncHandler');
const { getDBStatus } = require('../config/db');

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * Checks MongoDB connection status
 */
router.get(
  '/health',
  asyncHandler((req, res) => {
    const dbConnected = getDBStatus();
    res.status(dbConnected ? 200 : 503).json({
      success: true,
      status: dbConnected ? 'healthy' : 'unhealthy',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  })
);

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/daily-log', dailyLogRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/carbon-mirror', carbonMirrorRoutes);
router.use('/mitigation-plan', mitigationPlanRoutes);
router.use('/streak', streakRoutes);
router.use('/emission-factors', emissionFactorsRoutes);
router.use('/admin', adminRoutes);

/**
 * 501 Not Implemented Placeholder for PDF Export
 * POST /api/pdf/export
 */
router.post('/pdf/export', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'PDF export is not yet implemented'
  });
});

module.exports = router;
