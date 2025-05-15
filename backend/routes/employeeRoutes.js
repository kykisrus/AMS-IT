const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { auth } = require('../middleware/auth');

// Получение списка всех сотрудников
router.get('/', auth, employeeController.getEmployees);

// Импорт сотрудников из CSV
router.post('/import', auth, employeeController.importEmployees);

// Получение информации о конкретном сотруднике
router.get('/:id', auth, employeeController.getEmployee);

// Создание нового сотрудника
router.post('/', auth, employeeController.createEmployee);

// Получение актов сотрудника
router.get('/:id/acts', auth, employeeController.getEmployeeActs);

module.exports = router; 