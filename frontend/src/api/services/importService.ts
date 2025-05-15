import axios from 'axios';
import {
  ImportType,
  ImportSettings,
  ColumnMapping,
  ImportDocument,
  ValidationResult,
  ImportProgress,
  PreviewData
} from '../../types/import';

const API_URL = process.env.REACT_APP_API_URL || '';

export const importService = {
  // Получение списка колонок для типа импорта
  async getColumns(type: ImportType): Promise<Array<{
    name: string;
    label: string;
    required: boolean;
  }>> {
    const response = await axios.get(`${API_URL}/api/import/columns/${type}`);
    return response.data;
  },

  // Загрузка файла
  async uploadFile(file: File, type: ImportType): Promise<{ fileId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await axios.post(`${API_URL}/api/import/upload`, formData);
    return response.data;
  },

  // Валидация файла
  async validateFile(file: File, type: ImportType): Promise<{
    headers: string[];
    isValid: boolean;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post(`${API_URL}/api/import/validate`, formData);
    return response.data;
  },

  // Валидация колонок
  async validateColumns(fileId: string, mapping: ColumnMapping[]): Promise<ValidationResult> {
    const response = await axios.post(`${API_URL}/api/import/${fileId}/validate-mapping`, { mapping });
    return response.data;
  },

  // Запуск импорта
  async startImport(fileId: string, settings: ImportSettings): Promise<ImportDocument> {
    const response = await axios.post(`${API_URL}/api/import/${fileId}/start`, { settings });
    return response.data;
  },

  // Получение прогресса
  async getProgress(importId: string): Promise<ImportProgress> {
    const response = await axios.get(`${API_URL}/api/import/${importId}/progress`);
    return response.data;
  },

  // Получение истории импортов
  async getImportHistory(page: number = 1, limit: number = 10): Promise<{
    items: ImportDocument[];
    total: number;
  }> {
    const response = await axios.get(`${API_URL}/api/import/history`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Получение деталей импорта
  async getImportDetails(importId: string): Promise<ImportDocument> {
    const response = await axios.get(`${API_URL}/api/import/${importId}`);
    return response.data;
  },

  // Отмена импорта
  async cancelImport(importId: string): Promise<void> {
    await axios.post(`${API_URL}/api/import/${importId}/cancel`);
  },

  // Загрузка шаблона
  async downloadTemplate(type: ImportType): Promise<Blob> {
    const response = await axios.get(`${API_URL}/api/import/template/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Получение предпросмотра данных
  async getPreview(fileId: string): Promise<PreviewData> {
    const response = await axios.get(`${API_URL}/api/import/${fileId}/preview`);
    return response.data;
  }
}; 