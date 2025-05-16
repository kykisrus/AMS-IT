import { Request, Response } from 'express';
import { ImportService } from '../services/importService';
import { ImportType, ImportSettings } from '../types/import';
import { upload } from '../middleware/upload';

export class ImportController {
  private importService: ImportService;

  constructor() {
    this.importService = new ImportService();
  }

  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
      }

      const type = req.body.type as ImportType;
      const preview = await this.importService.processFile(req.file, type);
      res.json(preview);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      res.status(500).json({ message: 'Ошибка обработки файла' });
    }
  };

  startImport = async (req: Request, res: Response) => {
    try {
      const { type, settings, fileId } = req.body;
      const job = await this.importService.startImport(type, settings, fileId);
      res.json(job);
    } catch (error) {
      console.error('Ошибка запуска импорта:', error);
      res.status(500).json({ message: 'Ошибка запуска импорта' });
    }
  };

  getJobStatus = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const job = await this.importService.getJobStatus(jobId);
      res.json(job);
    } catch (error) {
      console.error('Ошибка получения статуса импорта:', error);
      res.status(500).json({ message: 'Ошибка получения статуса импорта' });
    }
  };

  cancelImport = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      await this.importService.cancelImport(jobId);
      res.json({ message: 'Импорт отменен' });
    } catch (error) {
      console.error('Ошибка отмены импорта:', error);
      res.status(500).json({ message: 'Ошибка отмены импорта' });
    }
  };

  getImportHistory = async (req: Request, res: Response) => {
    try {
      const history = await this.importService.getImportHistory();
      res.json(history);
    } catch (error) {
      console.error('Ошибка получения истории импорта:', error);
      res.status(500).json({ message: 'Ошибка получения истории импорта' });
    }
  };
} 