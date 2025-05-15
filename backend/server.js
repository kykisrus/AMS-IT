const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const db = require('./config/database');
const equipmentRoutes = require('./routes/equipment');
const dashboardRoutes = require('./routes/dashboard');
const actsRoutes = require('./routes/acts');
const employeeRoutes = require('./routes/employeeRoutes');
const roleRoutes = require('./routes/roleRoutes');
const companyRoutes = require('./routes/companyRoutes');
const importRoutes = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 3001;

// Настройки CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/acts', actsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/import', importRoutes);

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

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Если сервер запущен с ключом --log, пишем логи в файл
if (process.argv.includes('--log')) {
  const logStream = fs.createWriteStream(path.join(logDir, 'server.log'), { flags: 'a' });
  const origLog = console.log;
  const origError = console.error;
  console.log = (...args) => {
    logStream.write(`[LOG ${new Date().toISOString()}] ` + args.join(' ') + '\n');
    origLog(...args);
  };
  console.error = (...args) => {
    logStream.write(`[ERROR ${new Date().toISOString()}] ` + args.join(' ') + '\n');
    origError(...args);
  };
}

// Подключение к базе данных
db.getConnection()
  .then((connection) => {
    console.log('Successfully connected to the database');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}); 