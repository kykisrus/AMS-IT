import axios from 'axios';
import { ImportType, ImportJob, ImportSettings, DbColumn, ImportPreview } from '../../types/import';
import { API_URL } from '../../config';

class ImportService {
  private readonly baseUrl = `${API_URL}/api/import`;

  async getColumns(type: ImportType): Promise<DbColumn[]> {
    const response = await axios.get(`${this.baseUrl}/columns/${type}`);
    return response.data;
  }

  async validateFile(file: File, type: ImportType): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axios.post(`${this.baseUrl}/validate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          isValid: false,
          errors: [error.response.data.message || 'Ошибка валидации файла']
        };
      }
      return {
        isValid: false,
        errors: ['Неизвестная ошибка при валидации файла']
      };
    }
  }

  async uploadFile(file: File, type: ImportType): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await axios.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки файла');
      }
      throw error;
    }
  }

  async getPreview(fileId: string): Promise<ImportPreview> {
    try {
      const response = await axios.get(`${this.baseUrl}/preview/${fileId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка получения предпросмотра');
      }
      throw new Error('Неизвестная ошибка при получении предпросмотра');
    }
  }

  async startImport(
    type: ImportType,
    settings: ImportSettings,
    fileId: string
  ): Promise<ImportJob> {
    try {
      const response = await axios.post(`${this.baseUrl}/start`, {
        type,
        settings,
        fileId,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка запуска импорта');
      }
      throw error;
    }
  }

  async getImportJobs(): Promise<ImportJob[]> {
    const response = await axios.get(`${this.baseUrl}/jobs`);
    return response.data;
  }

  async getJobStatus(jobId: string): Promise<ImportJob> {
    try {
      const response = await axios.get(`${this.baseUrl}/status/${jobId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка получения статуса импорта');
      }
      throw error;
    }
  }

  async downloadReport(id: string): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/jobs/${id}/report`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteImportJob(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/jobs/${id}`);
  }

  async getHistory(page: number, pageSize: number): Promise<{ items: ImportJob[]; total: number }> {
    const response = await axios.get(`${this.baseUrl}/history`, {
      params: { page, pageSize }
    });
    return response.data;
  }

  async cancelImport(jobId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/cancel/${jobId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка отмены импорта');
      }
      throw error;
    }
  }

  async downloadTemplate(type: ImportType): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/templates/${type}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка загрузки шаблона');
      }
      throw new Error('Неизвестная ошибка при загрузке шаблона');
    }
  }

  async getImportHistory(): Promise<ImportJob[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/history`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка получения истории импорта');
      }
      throw error;
    }
  }
}

export const importService = new ImportService(); 