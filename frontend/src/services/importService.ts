import { ImportType, ImportJob, ImportSettings, DbColumn, ImportPreview } from '../types/import';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001'
});

class ImportService {
  async getColumns(type: ImportType): Promise<DbColumn[]> {
    const response = await api.get(`/import/columns/${type}`);
    return response.data;
  }

  async validateFile(file: File, type: ImportType): Promise<{ isValid: boolean; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/import/validate/${type}`, formData);
    return response.data;
  }

  async uploadFile(file: File, type: ImportType): Promise<{ fileId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/import/upload/${type}`, formData);
    return response.data;
  }

  async getPreview(fileId: string): Promise<ImportPreview> {
    const response = await api.get(`/import/preview/${fileId}`);
    return response.data;
  }

  async startImport(fileId: string, settings: ImportSettings): Promise<ImportJob> {
    const response = await api.post(`/import/start/${fileId}`, settings);
    return response.data;
  }

  async getStatus(jobId: string): Promise<ImportJob> {
    const response = await api.get(`/import/status/${jobId}`);
    return response.data;
  }

  async getReport(jobId: string): Promise<Blob> {
    const response = await api.get(`/import/report/${jobId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadTemplate(type: ImportType): Promise<Blob> {
    const response = await api.get(`/import/templates/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async getHistory(page: number, perPage: number): Promise<{ items: ImportJob[]; total: number }> {
    const response = await api.get(`/import/history`, {
      params: {
        page,
        per_page: perPage
      }
    });
    return response.data;
  }
}

export const importService = new ImportService(); 