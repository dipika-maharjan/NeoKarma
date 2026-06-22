const express = require('express');
const router = express.Router();
const translateController = require('../controllers/translate.controller');
const asyncHandler = require('../utils/asyncHandler');

router.post('/', asyncHandler(translateController.translate));

module.exports = router;
