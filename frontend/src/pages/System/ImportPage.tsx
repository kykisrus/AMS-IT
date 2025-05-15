import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Container,
  Button,
  Alert,
  Tabs,
  Tab
} from '@mui/material';

// Импорт компонентов шагов
import ImportTypeStep from '../../components/import/ImportTypeStep';
import FileUploadStep from '../../components/import/FileUploadStep';
import ColumnMappingStep from '../../components/import/ColumnMappingStep';
import PreviewStep from '../../components/import/PreviewStep';
import ImportSettingsStep from '../../components/import/ImportSettingsStep';
import ImportProgress from '../../components/import/ImportProgress';
import ImportHistory from '../../components/import/ImportHistory';

// Импорт типов и сервисов
import {
  ImportType,
  ImportJob,
  ImportSettings,
  DbColumn,
  ImportPreview,
  ValidationMode,
  ColumnMapping
} from '../../types/import';
import { importService } from '../../services/importService';

// Шаги импорта
const steps = [
  'Выбор типа импорта',
  'Загрузка файла',
  'Сопоставление полей',
  'Настройки импорта',
  'Подтверждение'
];

enum ImportStep {
  SELECT_TYPE,
  UPLOAD_FILE,
  MAP_COLUMNS,
  SETTINGS,
  PROGRESS
}

const ImportPage: React.FC = () => {
  // Состояния
  const [currentStep, setCurrentStep] = useState<ImportStep>(ImportStep.SELECT_TYPE);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importJob, setImportJob] = useState<ImportJob | null>(null);
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null);
  const [dbColumns, setDbColumns] = useState<DbColumn[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [settings, setSettings] = useState<ImportSettings>({
    duplicateHandling: 'skip',
    validationMode: ValidationMode.STRICT,
    logLevel: 'detailed',
    batchSize: 100,
    notifyOnComplete: true,
    skipEmptyValues: false
  });

  // Загрузка колонок при выборе типа импорта
  useEffect(() => {
    if (selectedType) {
      loadColumns();
    }
  }, [selectedType]);

  const loadColumns = async () => {
    if (!selectedType) return;
    
    try {
      const columns = await importService.getColumns(selectedType);
      setDbColumns(columns);
    } catch (err) {
      setError('Ошибка при загрузке структуры данных');
    }
  };

  const handleTypeSelect = (type: ImportType) => {
    setSelectedType(type);
    setCurrentStep(ImportStep.UPLOAD_FILE);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedType) return;

    setError(null);
    try {
      // Валидация файла
      const validationResult = await importService.validateFile(file, selectedType);
      if (!validationResult.isValid) {
        setError(validationResult.errors.join('\n'));
        return;
      }

      // Загрузка файла
      const { fileId } = await importService.uploadFile(file, selectedType);
      setFileId(fileId);
      setCurrentStep(ImportStep.MAP_COLUMNS);
    } catch (err) {
      setError('Ошибка при загрузке файла');
    }
  };

  const handleColumnMapping = async (columnMapping: ColumnMapping[]) => {
    setMapping(columnMapping);
    try {
      // Получение предпросмотра
      if (fileId) {
        const preview = await importService.getPreview(fileId);
        setPreviewData(preview);
        setCurrentStep(ImportStep.SETTINGS);
      }
    } catch (err) {
      setError('Ошибка при получении предпросмотра');
    }
  };

  const handleStartImport = async (settings: ImportSettings) => {
    try {
      if (fileId) {
        const job = await importService.startImport(fileId, settings);
        setImportJob(job);
        setCurrentStep(ImportStep.PROGRESS);
      }
    } catch (err) {
      setError('Ошибка при запуске импорта');
    }
  };

  // Рендер контента в зависимости от текущего шага
  const renderStepContent = () => {
    switch (currentStep) {
      case ImportStep.SELECT_TYPE:
        return <ImportTypeStep onSelect={handleTypeSelect} selectedType={selectedType} />;
      case ImportStep.UPLOAD_FILE:
        return <FileUploadStep onUpload={handleFileUpload} type={selectedType!} />;
      case ImportStep.MAP_COLUMNS:
        return <ColumnMappingStep 
          fileId={fileId!}
          type={selectedType!}
          onComplete={handleColumnMapping}
        />;
      case ImportStep.SETTINGS:
        return <ImportSettingsStep
          type={selectedType!}
          onStart={handleStartImport}
        />;
      case ImportStep.PROGRESS:
        return <ImportProgress
          importId={importJob?.id!}
          onComplete={() => setActiveTab(1)}
        />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Импорт" />
          <Tab label="История" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStepContent()}

      {activeTab === 1 && (
        <ImportHistory
          onViewDetails={(job) => {
            setImportJob(job);
            setActiveTab(0);
          }}
        />
      )}
    </Container>
  );
};

export default ImportPage; 