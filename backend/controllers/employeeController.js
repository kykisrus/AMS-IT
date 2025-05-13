const db = require('../config/database');

// Получение списка всех сотрудников
const getEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.position,
        u.department,
        u.company,
        m.full_name as manager_name,
        m.id as manager_id,
        GROUP_CONCAT(e.inventory_number) as equipment
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      LEFT JOIN equipment e ON e.current_owner_id = u.id
      GROUP BY u.id
    `);

    // Преобразуем строку с оборудованием в массив
    const formattedEmployees = employees.map(emp => ({
      ...emp,
      equipment: emp.equipment ? emp.equipment.split(',') : [],
      manager: {
        id: emp.manager_id,
        full_name: emp.manager_name
      }
    }));

    res.json(formattedEmployees);
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
        u.id,
        u.full_name,
        u.position,
        u.department,
        u.company,
        m.full_name as manager_name,
        m.id as manager_id,
        GROUP_CONCAT(e.inventory_number) as equipment
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      LEFT JOIN equipment e ON e.current_owner_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employees[0];
    const formattedEmployee = {
      ...employee,
      equipment: employee.equipment ? employee.equipment.split(',') : [],
      manager: {
        id: employee.manager_id,
        full_name: employee.manager_name
      }
    };

    res.json(formattedEmployee);
  } catch (error) {
    console.error('Error getting employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Создание нового сотрудника
const createEmployee = async (req, res) => {
  try {
    const { full_name, position, department, company, manager_id } = req.body;

    const [result] = await db.query(
      `INSERT INTO users (full_name, position, department, company, manager_id, role)
       VALUES (?, ?, ?, ?, ?, 'employee')`,
      [full_name, position, department, company, manager_id]
    );

    res.status(201).json({
      id: result.insertId,
      full_name,
      position,
      department,
      company,
      manager_id
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