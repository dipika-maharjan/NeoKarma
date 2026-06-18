/**
 * Share Routes
 * Public shareable achievement profiles
 */
const express = require('express');
const shareController = require('../controllers/share.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/share/generate
 * Generate/retrieve share link for current user
 * Auth required
 */
router.post('/generate', authMiddleware, shareController.generateShare);

/**
 * GET /api/share/:shareId
 * Retrieve public achievement profile
 * No auth required (public endpoint)
 */
router.get('/:shareId', shareController.getPublicProfile);

/**
 * DELETE /api/share/:shareId
 * Disable sharing
 * Auth required - user can only disable their own share
 */
router.delete('/:shareId', authMiddleware, shareController.disableShare);

module.exports = router;
