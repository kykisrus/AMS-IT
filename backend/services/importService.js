const db = require('../config/database');
const config = require('../config/env.config');
const path = require('path');
const fs = require('fs').promises;
const csv = require('csv-parse');

class ImportService {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', config.upload.directory);
  }

  async getImportableColumns(type) {
    const columnMappings = {
      employees: [
        { name: 'full_name', label: 'ФИО', type: 'string', required: true },
        { name: 'position', label: 'Должность', type: 'string', required: true },
        { name: 'department', label: 'Отдел', type: 'string', required: false },
        { name: 'hire_date', label: 'Дата приёма', type: 'date', required: true }
      ],
      equipment: [
        { name: 'inventory_number', label: 'Инвентарный номер', type: 'string', required: true },
        { name: 'type', label: 'Тип', type: 'string', required: true },
        { name: 'model', label: 'Модель', type: 'string', required: false },
        { name: 'serial_number', label: 'Серийный номер', type: 'string', required: false },
        { name: 'manufacturer', label: 'Производитель', type: 'string', required: false },
        { name: 'purchase_date', label: 'Дата покупки', type: 'date', required: true },
        { name: 'purchase_cost', label: 'Стоимость', type: 'decimal', required: false }
      ]
    };

    return columnMappings[type] || [];
  }

  async validateFile(filePath, type, settings) {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM ?? WHERE ?', [type, settings.uniqueField]);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      const results = {
        isValid: true,
        errors: [],
        duplicates: []
      };

      csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      })
      .on('data', (row) => {
        // Валидация данных
        const columns = this.getImportableColumns(type);
        columns.forEach(col => {
          if (col.required && !row[col.name]) {
            results.errors.push(`Отсутствует обязательное поле ${col.label} в строке`);
            results.isValid = false;
          }
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
    });
  }

  async startImport(fileId, type, settings) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const filePath = path.join(this.uploadDir, fileId);
      const fileContent = await fs.readFile(filePath, 'utf-8');

      const importJob = {
        type,
        status: 'in_progress',
        total_rows: 0,
        processed_rows: 0,
        failed_rows: 0,
        settings: JSON.stringify(settings),
        start_time: new Date()
      };

      const [jobResult] = await connection.query('INSERT INTO import_jobs SET ?', [importJob]);
      const jobId = jobResult.insertId;

      // Чтение и импорт данных
      await new Promise((resolve, reject) => {
        csv.parse(fileContent, {
          columns: true,
          skip_empty_lines: true
        })
        .on('data', async (row) => {
          try {
            await connection.query('INSERT INTO ?? SET ?', [type, row]);
            importJob.processed_rows++;
          } catch (error) {
            importJob.failed_rows++;
            await connection.query(
              'INSERT INTO import_errors (job_id, row_data, error_message) VALUES (?, ?, ?)',
              [jobId, JSON.stringify(row), error.message]
            );
          }
        })
        .on('end', resolve)
        .on('error', reject);
      });

      await connection.commit();
      return { jobId, status: 'completed' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getImportStatus(jobId) {
    const [rows] = await db.query(
      'SELECT * FROM import_jobs WHERE id = ?',
      [jobId]
    );
    return rows[0];
  }

  async getImportHistory(page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;
    const [rows] = await db.query(
      'SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [perPage, offset]
    );
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM import_jobs');
    
    return {
      items: rows,
      total: countResult[0].total
    };
  }
}

module.exports = new ImportService(); 