/**
 * Profile Routes
 */
const express = require('express');
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware);

/**
 * GET /api/profile
 */
router.get('/', profileController.getProfile);

/**
 * PATCH /api/profile
 */
router.patch('/', profileController.updateProfile);

module.exports = router;
