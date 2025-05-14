const db = require('../config/database');

// Получение списка всех сотрудников
const getEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        e.id,
        e.full_name,
        e.position,
        e.department,
        c.name as company,
        m.full_name as manager_name,
        m.id as manager_id,
        e.hire_date,
        e.is_active,
        e.created_at
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN employees m ON e.manager_id = m.id
      ORDER BY e.id DESC
    `);

    res.json(employees);
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получение информации о конкретном сотруднике
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [employees] = await db.query(`
      SELECT 
        e.id,
        e.full_name,
        e.position,
        e.department,
        c.name as company,
        m.full_name as manager_name,
        m.id as manager_id,
        e.hire_date,
        e.is_active,
        e.created_at
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
      LIMIT 1
    `, [id]);

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Error getting employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Создание нового сотрудника
const createEmployee = async (req, res) => {
  try {
    const { full_name, position, department, company_id, manager_id, hire_date } = req.body;
    const [result] = await db.query(
      `INSERT INTO employees (full_name, position, department, company_id, manager_id, hire_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, position, department, company_id, manager_id, hire_date]
    );
    res.status(201).json({
      id: result.insertId,
      full_name,
      position,
      department,
      company_id,
      manager_id,
      hire_date
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получение актов сотрудника
const getEmployeeActs = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [acts] = await db.query(`
      SELECT 
        a.id,
        a.act_number,
        a.type,
        a.status,
        a.date,
        e.inventory_number as equipment
      FROM acts a
      LEFT JOIN act_equipment ae ON a.id = ae.act_id
      LEFT JOIN equipment e ON ae.equipment_id = e.id
      WHERE a.created_by = ? OR a.approved_by = ?
    `, [id, id]);

    res.json(acts);
  } catch (error) {
    console.error('Error getting employee acts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  getEmployeeActs
}; 