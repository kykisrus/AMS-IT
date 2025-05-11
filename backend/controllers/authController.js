const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Регистрация нового пользователя
const register = async (req, res) => {
  try {
    const { username, password, email, full_name, role } = req.body;
    if (!username || !password || !email || !full_name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Разрешаем регистрацию только если пользователей нет
    const countRes = await db.query('SELECT COUNT(*) as cnt FROM users');
    const userCount = countRes.rows[0].cnt || countRes.rows[0].COUNT || countRes.rows[0]['COUNT(*)'] || 0;
    if (parseInt(userCount) > 0) {
      return res.status(403).json({ error: 'Registration is closed. Only the first user can register.' });
    }
    // Проверка существования пользователя
    const userExists = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    // Вставка пользователя
    await db.query(
      'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, full_name, role]
    );
    // Получаем только что созданного пользователя
    const result = await db.query(
      'SELECT id, username, email, full_name, role FROM users WHERE username = ?',
      [username]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Логин по username или email
const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }
    // Поиск пользователя по username или email
    const result = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username || '', email || '']
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      user: {
        id: user.id,
        username: user.username,
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
    const result = await db.query(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile
}; 