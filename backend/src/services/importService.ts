import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import csvtojson from 'csvtojson';
import mysql from 'mysql2/promise';
import { ImportType, ImportSettings, ImportJob, ImportPreview, ImportError } from '../types/import';
import { config } from '../config';

export class ImportService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool(config.database);
  }

  async processFile(file: Express.Multer.File, type: ImportType): Promise<ImportPreview> {
    const fileStream = createReadStream(file.path);
    const fileId = uuidv4();
    const errors: ImportError[] = [];
    const rows: Record<string, any>[] = [];
    let headers: string[] = [];

    try {
      const jsonArray = await csvtojson({
        delimiter: ';',
        trim: true,
        checkType: true,
        ignoreEmpty: true
      }).fromStream(fileStream);

      if (jsonArray.length === 0) {
        throw new Error('Файл не содержит данных');
      }

      headers = Object.keys(jsonArray[0]);
      rows.push(...jsonArray);

      // Валидация данных
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (const header of headers) {
          if (!row[header] && row[header] !== 0) {
            errors.push({
              row: i + 1,
              column: header,
              message: 'Пустое значение',
              value: row[header]
            });
          }
        }
      }

      return {
        headers,
        rows,
        errors,
        totalRows: rows.length,
        fileId
      };
    } catch (error) {
      console.error('Ошибка обработки файла:', error);
      throw new Error('Ошибка обработки файла');
    }
  }

  async startImport(type: ImportType, settings: ImportSettings, fileId: string): Promise<ImportJob> {
    const jobId = uuidv4();
    const job: ImportJob = {
      id: jobId,
      type,
      status: 'pending',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      errors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Сохраняем задачу в базу данных
      await this.pool.execute(
        'INSERT INTO import_jobs (id, type, status, settings, file_id) VALUES (?, ?, ?, ?, ?)',
        [jobId, type, 'pending', JSON.stringify(settings), fileId]
      );

      // Запускаем импорт в фоновом режиме
      this.processImport(job, settings).catch(console.error);

      return job;
    } catch (error) {
      console.error('Ошибка создания задачи импорта:', error);
      throw new Error('Ошибка создания задачи импорта');
    }
  }

  private async processImport(job: ImportJob, settings: ImportSettings): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM import_files WHERE id = ?',
        [job.fileId]
      );

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        throw new Error('Файл не найден');
      }

      const file = rows[0] as any;
      const fileStream = createReadStream(file.path);
      const jsonArray = await csvtojson({
        delimiter: ';',
        trim: true,
        checkType: true,
        ignoreEmpty: settings.skipEmptyValues
      }).fromStream(fileStream);

      job.totalRecords = jsonArray.length;
      job.status = 'processing';
      await this.updateJobStatus(job);

      const batchSize = settings.batchSize;
      for (let i = 0; i < jsonArray.length; i += batchSize) {
        const batch = jsonArray.slice(i, i + batchSize);
        await this.processBatch(batch, job, settings, connection);
        job.processedRecords = Math.min(i + batchSize, jsonArray.length);
        job.progress = Math.round((job.processedRecords / job.totalRecords) * 100);
        await this.updateJobStatus(job);
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      await this.updateJobStatus(job);
    } catch (error) {
      console.error('Ошибка импорта:', error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.updateJobStatus(job);
    }
  }

  private async processBatch(
    batch: Record<string, any>[],
    job: ImportJob,
    settings: ImportSettings,
    connection: mysql.PoolConnection
  ): Promise<void> {
    try {
      await connection.beginTransaction();

      for (const row of batch) {
        try {
          await this.insertRow(row, job.type, settings, connection);
        } catch (error) {
          if (settings.validationMode === 'strict') {
            throw error;
          }
          job.errors.push({
            row: job.processedRecords + 1,
            column: Object.keys(row).join(', '),
            message: error instanceof Error ? error.message : 'Неизвестная ошибка',
            value: JSON.stringify(row)
          });
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  private async insertRow(
    row: Record<string, any>,
    type: ImportType,
    settings: ImportSettings,
    connection: mysql.PoolConnection
  ): Promise<void> {
    const table = this.getTableName(type);
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map(() => '?').join(', ');

    if (settings.duplicateHandling === 'update') {
      const updateClause = columns
        .map(column => `${column} = VALUES(${column})`)
        .join(', ');

      await connection.execute(
        `INSERT INTO ${table} (${columns.join(', ')})
         VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        values
      );
    } else {
      await connection.execute(
        `INSERT INTO ${table} (${columns.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    }
  }

  private getTableName(type: ImportType): string {
    switch (type) {
      case 'employees':
        return 'employees';
      case 'departments':
        return 'departments';
      case 'positions':
        return 'positions';
      case 'documents':
        return 'documents';
      default:
        throw new Error('Неизвестный тип импорта');
    }
  }

  async getJobStatus(jobId: string): Promise<ImportJob> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM import_jobs WHERE id = ?',
        [jobId]
      );

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        throw new Error('Задача не найдена');
      }

      const job = rows[0] as any;
      return {
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        totalRecords: job.total_records,
        processedRecords: job.processed_records,
        errors: JSON.parse(job.errors || '[]'),
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        completedAt: job.completed_at,
        error: job.error
      };
    } catch (error) {
      console.error('Ошибка получения статуса задачи:', error);
      throw new Error('Ошибка получения статуса задачи');
    }
  }

  private async updateJobStatus(job: ImportJob): Promise<void> {
    try {
      await this.pool.execute(
        `UPDATE import_jobs
         SET status = ?, progress = ?, total_records = ?, processed_records = ?,
             errors = ?, updated_at = ?, completed_at = ?, error = ?
         WHERE id = ?`,
        [
          job.status,
          job.progress,
          job.totalRecords,
          job.processedRecords,
          JSON.stringify(job.errors),
          new Date().toISOString(),
          job.completedAt,
          job.error,
          job.id
        ]
      );
    } catch (error) {
      console.error('Ошибка обновления статуса задачи:', error);
      throw new Error('Ошибка обновления статуса задачи');
    }
  }

  async cancelImport(jobId: string): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE import_jobs SET status = ?, updated_at = ? WHERE id = ?',
        ['cancelled', new Date().toISOString(), jobId]
      );
    } catch (error) {
      console.error('Ошибка отмены импорта:', error);
      throw new Error('Ошибка отмены импорта');
    }
  }

  async getImportHistory(): Promise<ImportJob[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT 100'
      );

      return (rows as any[]).map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        totalRecords: job.total_records,
        processedRecords: job.processed_records,
        errors: JSON.parse(job.errors || '[]'),
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        completedAt: job.completed_at,
        error: job.error
      }));
    } catch (error) {
      console.error('Ошибка получения истории импорта:', error);
      throw new Error('Ошибка получения истории импорта');
    }
  }
} 