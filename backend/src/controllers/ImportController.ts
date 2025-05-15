import { Request, Response } from 'express';
import { ImportType, ImportSettings } from '../types/import';
import ImportService from '../services/ImportService';
import { uploadFile } from '../middleware/upload';

export class ImportController {
  async uploadFile(req: Request, res: Response) {
    try {
      const type = req.params.type as ImportType;
      const file = await uploadFile(req);
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const validationResult = await ImportService.validateFile(file.path, type);
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'File validation failed',
          details: validationResult.errors
        });
      }

      res.json({
        fileId: file.filename,
        headers: file.headers,
        validation: validationResult
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async startImport(req: Request, res: Response) {
    try {
      const { fileId, settings } = req.body as {
        fileId: string;
        settings: ImportSettings;
      };
      const type = req.params.type as ImportType;

      const importId = await ImportService.createImport(type, fileId, settings);
      
      // Запускаем процесс импорта асинхронно
      ImportService.processImport(importId).catch(error => {
        console.error('Error processing import:', error);
      });

      res.json({ importId });
    } catch (error) {
      console.error('Error starting import:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProgress(req: Request, res: Response) {
    try {
      const importId = req.params.importId;
      const importDoc = await ImportService.getProgress(importId);
      
      if (!importDoc) {
        return res.status(404).json({ error: 'Import not found' });
      }

      res.json(importDoc.progress);
    } catch (error) {
      console.error('Error getting import progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPreview(req: Request, res: Response) {
    try {
      const importId = req.params.importId;
      const previewData = await ImportService.getPreview(importId);
      res.json(previewData);
    } catch (error) {
      console.error('Error getting preview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async downloadTemplate(req: Request, res: Response) {
    try {
      const type = req.params.type as ImportType;
      const templatePath = await ImportService.getTemplatePath(type);
      res.download(templatePath);
    } catch (error) {
      console.error('Error downloading template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ImportController(); 