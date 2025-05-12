const db = require('../config/database');
const bcrypt = require('bcrypt');

// Получение списка руководителей
const getManagers = async (req, res) => {
  try {
    const [managers] = await db.pool.query(`
      SELECT id, full_name
      FROM users
      WHERE role = 'office_manager'
    `);

    res.json(managers);
  } catch (error) {
    console.error('Error getting managers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Создание нового пользователя
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Проверяем, существует ли пользователь с таким email
    const [existingUsers] = await db.pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const [result] = await db.pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [full_name, email, hashedPassword, role]
    );

    res.status(201).json({
      id: result.insertId,
      full_name,
      email,
      role
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getManagers,
  createUser
}; 