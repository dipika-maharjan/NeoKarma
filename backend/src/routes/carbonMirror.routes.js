/**
 * Carbon Mirror Routes
 */
const express = require('express');
const carbonMirrorController = require('../controllers/carbonMirror.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All carbon mirror routes require authentication
router.use(authMiddleware);

/**
 * GET /api/carbon-mirror
 */
router.get('/', carbonMirrorController.getMirror);

/**
 * POST /api/carbon-mirror/what-if
 */
router.post('/what-if', carbonMirrorController.calculateWhatIf);

module.exports = router;
