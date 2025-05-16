import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: process.env.DB_USER || 'it',
    password: process.env.DB_PASSWORD || 'HardWork@1LP',
    database: process.env.DB_NAME || 'ams_it'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'ngoCEf53/LNSJyWgfXrpidZPlQJVemk0P6u/6xzIsEs=',
    expiresIn: '24h'
  },

  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    securityHeaders: process.env.SECURITY_HEADERS === 'true'
  },

  upload: {
    directory: path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
  }
}; 