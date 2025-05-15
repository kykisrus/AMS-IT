const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Получение списка доступных колонок для типа импорта
router.get('/columns/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    // TODO: Implement getting columns for import type
    res.json([
      { name: 'name', label: 'Имя', type: 'string', required: true },
      { name: 'email', label: 'Email', type: 'string', required: true },
      { name: 'phone', label: 'Телефон', type: 'string', required: false }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Загрузка файла
router.post('/:type/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // TODO: Implement file processing
    res.json({ fileId: file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Валидация файла
router.post('/:type/validate', auth, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // TODO: Implement validation
    res.json({ isValid: true, errors: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение предпросмотра
router.get('/preview/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    // TODO: Implement preview generation
    res.json({
      headers: ['name', 'email', 'phone'],
      rows: [],
      validationResults: [],
      stats: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        duplicates: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Начало импорта
router.post('/start/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { settings } = req.body;

    // TODO: Implement import start
    res.json({
      id: 'job-123',
      status: 'pending',
      type: req.body.type,
      filename: fileId,
      totalRows: 0,
      processedRows: 0,
      failedRows: 0,
      settings,
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение статуса импорта
router.get('/status/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    // TODO: Implement status check
    res.json({
      id: jobId,
      status: 'in_progress',
      processedRows: 50,
      totalRows: 100,
      failedRows: 0,
      currentOperation: 'Processing data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение отчета
router.get('/report/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    // TODO: Implement report generation
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="import-report-${jobId}.csv"`);
    res.send('Report data');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение истории импортов
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;

    // TODO: Implement history retrieval
    res.json({
      items: [],
      total: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение шаблона
router.get('/templates/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    // TODO: Implement template generation
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-template.csv"`);
    res.send('Template data');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 