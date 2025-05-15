const db = require('../config/database');
const csv = require('csv-parse');
const fs = require('fs');

// Получение списка всех сотрудников
const getEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        e.id,
        CONCAT(e.last_name, ' ', e.first_name, ' ', COALESCE(e.middle_name, '')) as full_name,
        e.last_name,
        e.first_name,
        e.middle_name,
        e.position,
        e.department,
        e.phone,
        e.glpi_id,
        e.bitrix_id,
        c.name as company,
        c.id as company_id,
        m.id as manager_id,
        CONCAT(m.last_name, ' ', m.first_name, ' ', COALESCE(m.middle_name, '')) as manager_name,
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
    const { 
      last_name, 
      first_name, 
      middle_name, 
      position, 
      department, 
      company_id, 
      manager_id, 
      phone,
      glpi_id,
      bitrix_id,
      hire_date 
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO employees (
        last_name, 
        first_name, 
        middle_name, 
        position, 
        department, 
        company_id, 
        manager_id, 
        phone,
        glpi_id,
        bitrix_id,
        hire_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        last_name, 
        first_name, 
        middle_name, 
        position, 
        department, 
        company_id, 
        manager_id, 
        phone,
        glpi_id,
        bitrix_id,
        hire_date
      ]
    );
    
    res.status(201).json({
      id: result.insertId,
      last_name,
      first_name,
      middle_name,
      position,
      department,
      company_id,
      manager_id,
      phone,
      glpi_id,
      bitrix_id,
      hire_date
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message || 'Server error' });
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

// Импорт сотрудников из CSV
const importEmployees = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.files.file;
  const parser = csv.parse({ columns: true, delimiter: ',' });

  try {
    const records = [];
    const fileContent = file.data.toString();
    
    parser.on('readable', function() {
      let record;
      while (record = parser.read()) {
        records.push(record);
      }
    });

    parser.on('end', async function() {
      try {
        for (const record of records) {
          await db.query(
            `INSERT INTO employees (
              last_name,
              first_name,
              middle_name,
              position,
              department,
              company_id,
              phone,
              glpi_id,
              bitrix_id,
              hire_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              record.last_name,
              record.first_name,
              record.middle_name || null,
              record.position,
              record.department,
              record.company_id,
              record.phone || null,
              record.glpi_id || null,
              record.bitrix_id || null,
              record.hire_date
            ]
          );
        }
        res.json({ message: 'Employees imported successfully' });
      } catch (error) {
        console.error('Error importing employees:', error);
        res.status(500).json({ error: 'Error importing employees' });
      }
    });

    parser.write(fileContent);
    parser.end();
  } catch (error) {
    console.error('Error parsing CSV:', error);
    res.status(500).json({ error: 'Error parsing CSV file' });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  getEmployeeActs,
  importEmployees
}; 