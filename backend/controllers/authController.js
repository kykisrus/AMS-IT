const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Проверка наличия пользователей в системе
const checkUsers = async (req, res) => {
  try {
    const [countResult] = await db.query('SELECT COUNT(*) as cnt FROM users');
    const userCount = countResult[0].cnt;
    
    return res.json({ hasUsers: parseInt(userCount) > 0 });
  } catch (error) {
    console.error('Check users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Регистрация нового пользователя
const register = async (req, res) => {
  try {
    const { login, password, email, full_name, role } = req.body;
    if (!login || !password || !email || !full_name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Разрешаем регистрацию только если пользователей нет
    const [countResult] = await db.query('SELECT COUNT(*) as cnt FROM users');
    const userCount = countResult[0].cnt;
    
    if (parseInt(userCount) > 0) {
      return res.status(403).json({ error: 'Registration is closed. Only the first user can register.' });
    }

    // Проверка существования пользователя (используем username вместо login)
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [login, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставка пользователя (используем username вместо login)
    await db.query(
      'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [login, hashedPassword, email, full_name, role]
    );

    // Получаем только что созданного пользователя
    const [newUser] = await db.query(
      'SELECT id, username, email, full_name, role FROM users WHERE username = ?',
      [login]
    );

    const user = {
      id: newUser[0].id,
      login: newUser[0].username, // Маппим username на login для фронтенда
      email: newUser[0].email,
      full_name: newUser[0].full_name,
      role: newUser[0].role
    };
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Логин по username (login) или email
const login = async (req, res) => {
  try {
    const { login, email, password } = req.body;
    if ((!login && !email) || !password) {
      return res.status(400).json({ error: 'Login/email and password are required' });
    }

    // Поиск пользователя по username или email
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [login || '', email || '']
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      user: {
        id: user.id,
        login: user.username, // Маппим username на login для фронтенда
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Преобразуем username в login для фронтенда
    const user = {
      id: users[0].id,
      login: users[0].username,
      email: users[0].email,
      full_name: users[0].full_name,
      role: users[0].role
    };

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  checkUsers
}; 