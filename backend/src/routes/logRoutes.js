const express = require('express');
const { logFrontendMessage } = require('../controllers/logController');
const router = express.Router();

// POST /api/logs - Receive frontend logs
router.post('/', logFrontendMessage);

module.exports = router;