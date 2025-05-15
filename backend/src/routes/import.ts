import { Router } from 'express';
import ImportController from '../controllers/ImportController';

const router = Router();

// Загрузка файла
router.post('/:type/upload', ImportController.uploadFile);

// Начало импорта
router.post('/:type/start', ImportController.startImport);

// Получение прогресса
router.get('/:importId/progress', ImportController.getProgress);

// Получение предпросмотра
router.get('/:importId/preview', ImportController.getPreview);

// Скачивание шаблона
router.get('/:type/template', ImportController.downloadTemplate);

export default router; 