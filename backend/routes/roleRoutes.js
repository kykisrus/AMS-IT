const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { auth } = require('../middleware/auth');

// Получение списка ролей
router.get('/', auth, roleController.getRoles);

// Создание новой роли
router.post('/', auth, roleController.createRole);

// Обновление роли
router.put('/:id', auth, roleController.updateRole);

// Удаление роли
router.delete('/:id', auth, roleController.deleteRole);

module.exports = router; 