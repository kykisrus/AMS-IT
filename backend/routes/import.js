const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const importService = require('../services/importService');

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
    let columns = [];

    switch (type) {
      case 'equipment':
        columns = [
          { name: 'inventory_number', label: 'Инвентарный номер', type: 'string', required: true },
          { name: 'type', label: 'Тип', type: 'string', required: true },
          { name: 'model', label: 'Модель', type: 'string', required: false },
          { name: 'serial_number', label: 'Серийный номер', type: 'string', required: false },
          { name: 'manufacturer', label: 'Производитель', type: 'string', required: false },
          { name: 'purchase_date', label: 'Дата покупки', type: 'date', required: true },
          { name: 'purchase_cost', label: 'Стоимость', type: 'number', required: false },
          { name: 'description', label: 'Описание', type: 'string', required: false }
        ];
        break;
      case 'employees':
        columns = [
          { name: 'last_name', label: 'Фамилия', type: 'string', required: true },
          { name: 'first_name', label: 'Имя', type: 'string', required: true },
          { name: 'middle_name', label: 'Отчество', type: 'string', required: false },
          { name: 'position', label: 'Должность', type: 'string', required: true },
          { name: 'department', label: 'Отдел', type: 'string', required: false },
          { name: 'hire_date', label: 'Дата приема', type: 'date', required: true },
          { name: 'phone', label: 'Телефон', type: 'string', required: false },
          { name: 'email', label: 'Email', type: 'string', required: false }
        ];
        break;
      default:
        return res.status(400).json({ error: 'Неизвестный тип импорта' });
    }

    res.json(columns);
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
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const jobId = await importService.createImportJob(type, {}, req.user.id);
    res.json({ jobId, filename: file.filename });
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
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const results = await importService.processCSV(file.path, type);
    const validationResults = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows[i];
      const errors = await importService.validateData(row, type);
      if (errors.length > 0) {
        validationResults.push({
          lineNumber: i + 2, // +2 because of header row and 0-based index
          errors
        });
      }
    }

    res.json({
      headers: results.headers,
      rows: results.rows.slice(0, 10), // Preview first 10 rows
      validationResults,
      stats: {
        totalRows: results.rows.length,
        validRows: results.rows.length - validationResults.length,
        invalidRows: validationResults.length
      }
    });
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
router.post('/start/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { settings } = req.body;

    const job = await importService.getImportJob(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Задача импорта не найдена' });
    }

    await importService.updateImportJob(jobId, {
      status: 'in_progress',
      totalRows: 0,
      processedRows: 0,
      failedRows: 0
    });

    // Запускаем импорт асинхронно
    process.nextTick(async () => {
      try {
        const filePath = path.join(__dirname, '../uploads', job.filename);
        const results = await importService.processCSV(filePath, job.type, settings);
        
        let processedRows = 0;
        let failedRows = 0;

        for (const row of results.rows) {
          try {
            const errors = await importService.validateData(row, job.type);
            if (errors.length > 0) {
              await importService.addImportError(jobId, processedRows + 1, row, errors.join(', '));
              failedRows++;
            } else {
              // TODO: Implement actual data import
              processedRows++;
            }
          } catch (error) {
            await importService.addImportError(jobId, processedRows + 1, row, error.message);
            failedRows++;
          }
        }

        await importService.updateImportJob(jobId, {
          status: failedRows === 0 ? 'completed' : 'completed_with_errors',
          totalRows: results.rows.length,
          processedRows,
          failedRows
        });
      } catch (error) {
        await importService.updateImportJob(jobId, {
          status: 'failed',
          error: error.message
        });
      }
    });

    res.json({
      jobId,
      status: 'in_progress',
      message: 'Импорт начат'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение статуса импорта
router.get('/status/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await importService.getImportJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Задача импорта не найдена' });
    }

    const errors = await importService.getImportErrors(jobId);
    
    res.json({
      ...job,
      errors: errors.slice(0, 10) // Return only first 10 errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение отчета
router.get('/report/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await importService.getImportJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Задача импорта не найдена' });
    }

    const errors = await importService.getImportErrors(jobId);
    
    // Формируем CSV отчет
    const csvRows = [
      ['Статус', 'Всего строк', 'Обработано', 'Ошибок'],
      [job.status, job.total_rows, job.processed_rows, job.failed_rows],
      [],
      ['Ошибки импорта'],
      ['Строка', 'Данные', 'Ошибка']
    ];

    errors.forEach(error => {
      csvRows.push([
        error.line_number,
        error.row_data,
        error.error_message
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="import-report-${jobId}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение истории импортов
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

    const [rows] = await pool.execute(
      'SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [perPage, offset]
    );

    const [total] = await pool.execute('SELECT COUNT(*) as total FROM import_jobs');

    res.json({
      items: rows,
      total: total[0].total,
      page,
      perPage
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