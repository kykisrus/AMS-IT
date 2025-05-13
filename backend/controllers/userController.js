const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Получение списка пользователей
const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, login, role FROM users ORDER BY full_name'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получение списка руководителей
const getManagers = async (req, res) => {
  try {
    const [managers] = await db.query(
      'SELECT id, full_name FROM users WHERE role = "office_manager" ORDER BY full_name'
    );
    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Создание нового пользователя
const createUser = async (req, res) => {
  const { full_name, email, login, password, role } = req.body;

  try {
    // Проверка существования пользователя по email
    const [existingUsersByEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsersByEmail.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Проверка существования пользователя по логину
    const [existingUsersByLogin] = await db.query('SELECT id FROM users WHERE login = ?', [login]);
    if (existingUsersByLogin.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, login, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, login, hashedPassword, role]
    );

    res.status(201).json({
      id: result.insertId,
      full_name,
      email,
      login,
      role
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Обновление пользователя
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, login, role } = req.body;

  try {
    // Проверка существования пользователя
    const [existingUsers] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка уникальности email
    const [emailCheck] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Проверка уникальности логина
    const [loginCheck] = await db.query(
      'SELECT id FROM users WHERE login = ? AND id != ?',
      [login, id]
    );
    if (loginCheck.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    // Обновление пользователя
    await db.query(
      'UPDATE users SET full_name = ?, email = ?, login = ?, role = ? WHERE id = ?',
      [full_name, email, login, role, id]
    );

    res.json({ id, full_name, email, login, role });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
};

module.exports = {
  getUsers,
  getManagers,
  createUser,
  updateUser
}; 