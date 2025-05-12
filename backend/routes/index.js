const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const employeeRoutes = require('./employeeRoutes');
const equipmentRoutes = require('./equipmentRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/equipment', equipmentRoutes);

module.exports = router; 