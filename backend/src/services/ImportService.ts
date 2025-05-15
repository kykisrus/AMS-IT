import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { Transform } from 'stream';
import Import from '../models/Import';
import {
  ImportType,
  ImportStatus,
  ImportSettings,
  ColumnMapping,
  ValidationResult,
  PreviewData,
  ImportDocument
} from '../types/import';

export class ImportService {
  private static instance: ImportService;

  private constructor() {}

  public static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  async createImport(
    type: ImportType,
    filename: string,
    settings: ImportSettings
  ): Promise<string> {
    const importDoc = await Import.create({
      type,
      filename,
      settings,
      status: ImportStatus.PENDING
    });
    return importDoc._id;
  }

  async getProgress(importId: string) {
    const importDoc = await Import.findById(importId);
    if (!importDoc) {
      return null;
    }
    return importDoc;
  }

  async validateFile(
    filePath: string,
    type: ImportType
  ): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    let totalValidated = 0;
    const startTime = new Date();

    return new Promise((resolve, reject) => {
      const parser = parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true
      });

      const validator = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          totalValidated++;
          // Здесь будет специфичная для типа импорта валидация
          callback(null, chunk);
        }
      });

      createReadStream(filePath)
        .pipe(parser)
        .pipe(validator)
        .on('data', () => {})
        .on('end', () => {
          const endTime = new Date();
          resolve({
            isValid: errors.length === 0,
            errors,
            metadata: {
              totalValidated,
              startTime,
              endTime,
              duration: endTime.getTime() - startTime.getTime()
            }
          });
        })
        .on('error', (error: Error) => reject(error));
    });
  }

  async getPreview(importId: string): Promise<PreviewData> {
    const importDoc = await Import.findById(importId);
    if (!importDoc) {
      throw new Error('Import not found');
    }

    // Чтение первых N строк файла для предпросмотра
    const previewRows: Array<Record<string, string>> = [];
    const validationErrors: PreviewData['validationErrors'] = [];
    let totalRows = 0;
    let validRows = 0;
    let invalidRows = 0;
    let duplicates = 0;

    return new Promise((resolve, reject) => {
      const parser = parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true,
        to: 100 // Ограничиваем предпросмотр 100 строками
      });

      createReadStream(importDoc.filename)
        .pipe(parser)
        .on('data', (row) => {
          previewRows.push(row);
          totalRows++;
          // Здесь будет валидация и подсчет статистики
        })
        .on('end', () => {
          resolve({
            headers: Object.keys(previewRows[0] || {}),
            rows: previewRows,
            validationErrors,
            stats: {
              totalRows,
              validRows,
              invalidRows,
              duplicates
            }
          });
        })
        .on('error', (error: Error) => reject(error));
    });
  }

  async processImport(importId: string): Promise<void> {
    const importDoc = await Import.findById(importId);
    if (!importDoc) {
      throw new Error('Import not found');
    }

    importDoc.status = ImportStatus.PROCESSING;
    await importDoc.save();

    const batchSize = importDoc.settings.batchSize;
    let batch: Array<Record<string, string>> = [];
    let processedRows = 0;

    return new Promise((resolve, reject) => {
      const parser = parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true
      });

      const processor = new Transform({
        objectMode: true,
        transform: async (chunk, encoding, callback) => {
          try {
            batch.push(chunk);
            
            if (batch.length >= batchSize) {
              await this.processBatch(importDoc, batch);
              processedRows += batch.length;
              await importDoc.updateProgress(processedRows, importDoc.failedRows);
              batch = [];
            }
            
            callback();
          } catch (error) {
            callback(error instanceof Error ? error : new Error(String(error)));
          }
        },
        flush: async (callback) => {
          try {
            if (batch.length > 0) {
              await this.processBatch(importDoc, batch);
              processedRows += batch.length;
              await importDoc.updateProgress(processedRows, importDoc.failedRows);
            }
            callback();
          } catch (error) {
            callback(error instanceof Error ? error : new Error(String(error)));
          }
        }
      });

      createReadStream(importDoc.filename)
        .pipe(parser)
        .pipe(processor)
        .on('finish', async () => {
          importDoc.status = ImportStatus.COMPLETED;
          await importDoc.save();
          resolve();
        })
        .on('error', async (error) => {
          importDoc.status = ImportStatus.FAILED;
          await importDoc.save();
          reject(error);
        });
    });
  }

  private async processBatch(
    importDoc: ImportDocument,
    batch: Array<Record<string, string>>
  ): Promise<void> {
    // Здесь будет специфичная для типа импорта обработка пакета данных
    switch (importDoc.type) {
      case ImportType.EMPLOYEES:
        await this.processEmployeesBatch(batch);
        break;
      case ImportType.EQUIPMENT:
        await this.processEquipmentBatch(batch);
        break;
      case ImportType.COMPANIES:
        await this.processCompaniesBatch(batch);
        break;
    }
  }

  private async processEmployeesBatch(batch: Array<Record<string, string>>): Promise<void> {
    // Реализация обработки пакета сотрудников
  }

  private async processEquipmentBatch(batch: Array<Record<string, string>>): Promise<void> {
    // Реализация обработки пакета оборудования
  }

  private async processCompaniesBatch(batch: Array<Record<string, string>>): Promise<void> {
    // Реализация обработки пакета компаний
  }
}

export default ImportService.getInstance(); 