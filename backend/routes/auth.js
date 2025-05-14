const express = require('express');
const router = express.Router();
const { register, login, getProfile, checkUsers } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.get('/check-users', checkUsers);

// Защищенные маршруты
router.get('/profile', auth, getProfile);

module.exports = router; 