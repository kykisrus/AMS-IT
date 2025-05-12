const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Получение списка руководителей
router.get('/managers', userController.getManagers);

module.exports = router; 