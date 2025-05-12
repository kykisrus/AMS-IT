const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Получение списка всех сотрудников
router.get('/', employeeController.getEmployees);

// Получение информации о конкретном сотруднике
router.get('/:id', employeeController.getEmployee);

// Создание нового сотрудника
router.post('/', employeeController.createEmployee);

// Получение актов сотрудника
router.get('/:id/acts', employeeController.getEmployeeActs);

module.exports = router; 