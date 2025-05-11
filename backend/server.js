const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const db = require('./config/database');
const equipmentRoutes = require('./routes/equipment');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);

// API для Dashboard: количество пользователей и техники
app.get('/api/dashboard/counts', async (req, res) => {
  try {
    const [users] = await db.pool.query('SELECT COUNT(*) as count FROM users');
    const [equipment] = await db.pool.query('SELECT COUNT(*) as count FROM equipment');
    res.json({
      users: users[0]?.count || 0,
      equipment: equipment[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 