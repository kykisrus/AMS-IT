const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

router.get('/metrics', auth, getDashboardMetrics);

module.exports = router; 