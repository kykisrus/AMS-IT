import { Router } from 'express';
import { ImportController } from '../controllers/importController';
import { upload } from '../middleware/upload';

const router = Router();
const importController = new ImportController();

// Загрузка файла
router.post('/upload', upload.single('file'), importController.uploadFile);

// Начало импорта
router.post('/start', importController.startImport);

// Получение прогресса
router.get('/status/:jobId', importController.getJobStatus);

// Получение предпросмотра
// router.get('/preview/:jobId', importController.getPreview);

// Скачивание шаблона
// router.get('/template/:type', importController.downloadTemplate);

// Отмена импорта
router.post('/cancel/:jobId', importController.cancelImport);

// Получение истории импортов
router.get('/history', importController.getImportHistory);

export default router; 