const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth');

// Получение списка оборудования
router.get('/', auth, equipmentController.getEquipment);

// Получение оборудования по ID
router.get('/:id', auth, equipmentController.getEquipmentById);

// Создание нового оборудования
router.post('/', auth, equipmentController.createEquipment);

// Обновление оборудования
router.put('/:id', auth, equipmentController.updateEquipment);

// Удаление оборудования
router.delete('/:id', auth, equipmentController.deleteEquipment);

module.exports = router; 