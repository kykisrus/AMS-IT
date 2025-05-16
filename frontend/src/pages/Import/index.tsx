import React, { useState, useEffect } from 'react';
import { Upload, Button, Table, Card, Steps, message, Modal, Progress } from 'antd';
import { InboxOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Dragger } = Upload;
const { Step } = Steps;

interface ImportColumn {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface ValidationResult {
  lineNumber: number;
  errors: string[];
}

interface ImportStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

const ImportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [importType, setImportType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<ImportColumn[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Получение колонок для типа импорта
  const { data: columnsData, isLoading: isLoadingColumns } = useQuery({
    queryKey: ['importColumns', importType],
    queryFn: async () => {
      if (!importType) return [];
      const response = await axios.get(`/api/import/columns/${importType}`);
      return response.data;
    },
    enabled: !!importType
  });

  useEffect(() => {
    if (columnsData) {
      setColumns(columnsData);
    }
  }, [columnsData]);

  // Загрузка файла
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`/api/import/${importType}/upload`, formData);
      return response.data;
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      setCurrentStep(1);
      message.success('Файл успешно загружен');
    },
    onError: (error) => {
      message.error('Ошибка при загрузке файла');
    }
  });

  // Валидация файла
  const validateMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`/api/import/${importType}/validate`, formData);
      return response.data;
    },
    onSuccess: (data) => {
      setValidationResults(data.validationResults);
      setStats(data.stats);
      setCurrentStep(2);
    },
    onError: (error) => {
      message.error('Ошибка при валидации файла');
    }
  });

  // Начало импорта
  const startImportMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/import/start/${jobId}`, {
        settings: {} // TODO: Add mapping settings
      });
      return response.data;
    },
    onSuccess: () => {
      setCurrentStep(3);
      message.success('Импорт начат');
    },
    onError: (error) => {
      message.error('Ошибка при запуске импорта');
    }
  });

  // Получение статуса импорта
  const { data: importStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['importStatus', jobId],
    queryFn: async () => {
      const response = await axios.get(`/api/import/status/${jobId}`);
      return response.data;
    },
    enabled: !!jobId && currentStep === 3,
    refetchInterval: 2000
  });

  const handleFileUpload = (file: File) => {
    setFile(file);
    uploadMutation.mutate(file);
    return false;
  };

  const handleValidate = () => {
    if (file) {
      validateMutation.mutate(file);
    }
  };

  const handleStartImport = () => {
    startImportMutation.mutate();
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(`/api/import/report/${jobId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `import-report-${jobId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Ошибка при скачивании отчета');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Выберите тип импорта">
            <div style={{ marginBottom: 16 }}>
              <Button
                type={importType === 'equipment' ? 'primary' : 'default'}
                onClick={() => setImportType('equipment')}
                style={{ marginRight: 8 }}
              >
                Оборудование
              </Button>
              <Button
                type={importType === 'employees' ? 'primary' : 'default'}
                onClick={() => setImportType('employees')}
              >
                Сотрудники
              </Button>
            </div>
            {importType && (
              <Dragger
                accept=".csv"
                beforeUpload={handleFileUpload}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Нажмите или перетащите файл для загрузки</p>
                <p className="ant-upload-hint">Поддерживаются только CSV файлы</p>
              </Dragger>
            )}
          </Card>
        );

      case 1:
        return (
          <Card title="Валидация файла">
            <Button type="primary" onClick={handleValidate}>
              Начать валидацию
            </Button>
          </Card>
        );

      case 2:
        return (
          <Card title="Результаты валидации">
            {stats && (
              <div style={{ marginBottom: 16 }}>
                <p>Всего строк: {stats.totalRows}</p>
                <p>Валидных строк: {stats.validRows}</p>
                <p>Ошибок: {stats.invalidRows}</p>
              </div>
            )}
            {validationResults.length > 0 && (
              <Table
                dataSource={validationResults}
                columns={[
                  {
                    title: 'Строка',
                    dataIndex: 'lineNumber',
                    key: 'lineNumber'
                  },
                  {
                    title: 'Ошибки',
                    dataIndex: 'errors',
                    key: 'errors',
                    render: (errors: string[]) => errors.join(', ')
                  }
                ]}
                rowKey="lineNumber"
              />
            )}
            <Button
              type="primary"
              onClick={handleStartImport}
              disabled={!stats || stats.invalidRows > 0}
            >
              Начать импорт
            </Button>
          </Card>
        );

      case 3:
        return (
          <Card title="Статус импорта">
            {importStatus && (
              <>
                <Progress
                  percent={Math.round((importStatus.processedRows / importStatus.totalRows) * 100)}
                  status={importStatus.status === 'failed' ? 'exception' : 'active'}
                />
                <p>Статус: {importStatus.status}</p>
                <p>Обработано: {importStatus.processedRows} из {importStatus.totalRows}</p>
                {importStatus.status === 'completed' && (
                  <Button type="primary" onClick={handleDownloadReport}>
                    Скачать отчет
                  </Button>
                )}
              </>
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Загрузка файла" />
        <Step title="Валидация" />
        <Step title="Подтверждение" />
        <Step title="Импорт" />
      </Steps>
      {renderStepContent()}
    </div>
  );
};

export default ImportPage; 