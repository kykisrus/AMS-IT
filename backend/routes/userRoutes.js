const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Получение списка пользователей
router.get('/', auth, userController.getUsers);

// Получение списка руководителей
router.get('/managers', auth, userController.getManagers);

// Создание нового пользователя
router.post('/', auth, userController.createUser);

// Обновление пользователя
router.put('/:id', auth, userController.updateUser);

module.exports = router; 