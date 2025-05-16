import express from 'express';
import path from 'path';
import { config } from './config';
import importRoutes from './routes/import';
import authRoutes from './routes/auth';
import { corsMiddleware, rateLimitMiddleware, securityHeadersMiddleware } from './middleware/security';

const app = express();

// Middleware безопасности
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(securityHeadersMiddleware);

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Создаем директорию для загрузки файлов, если она не существует
const uploadDir = path.join(process.cwd(), config.upload.directory);
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}

// Маршруты
app.use('/api/import', importRoutes);
app.use('/api/auth', authRoutes);

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
  console.log(`Режим: ${config.nodeEnv}`);
  console.log(`CORS origin: ${config.security.corsOrigin}`);
}); 