import React, { useState } from 'react';
import { Box, Paper, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import ImportTypeStep from '../../components/import/ImportTypeStep';
import FileUploadStep from '../../components/import/FileUploadStep';
import ImportSettingsStep from '../../components/import/ImportSettingsStep';
import PreviewStep from '../../components/import/PreviewStep';
import ImportProgress from '../../components/import/ImportProgress';
import { ImportType, ImportSettings, ImportPreview, ImportJob } from '../../types/import';
import { importService } from '../../api/services/importService';

const steps = ['Тип импорта', 'Загрузка файла', 'Настройки', 'Предпросмотр', 'Импорт'];

const ImportPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ImportSettings>({
    duplicateHandling: 'skip',
    validationMode: 'strict',
    logLevel: 'basic',
    batchSize: 100,
    skipEmptyValues: true,
    notifyOnComplete: true
  });
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeSelect = (type: ImportType) => {
    setImportType(type);
    setError(null);
    setActiveStep(1);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!importType) return;

    setIsLoading(true);
    setError(null);

    try {
      const previewData = await importService.uploadFile(selectedFile, importType);
      setFile(selectedFile);
      setPreview(previewData);
      setActiveStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: ImportSettings) => {
    setSettings(newSettings);
  };

  const handleStartImport = async () => {
    if (!file || !importType || !preview) return;

    setIsLoading(true);
    setError(null);

    try {
      const jobData = await importService.startImport(importType, settings, preview.fileId);
      setJob(jobData);
      setActiveStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запуска импорта');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setActiveStep(0);
    setImportType(null);
    setFile(null);
    setPreview(null);
    setJob(null);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCancel = async () => {
    if (job) {
      try {
        await importService.cancelImport(job.id);
        setJob(null);
        setActiveStep(0);
      } catch (error) {
        console.error('Ошибка при отмене импорта:', error);
      }
    }
  };

  const handlePreviewComplete = (previewData: ImportPreview) => {
    setPreview(previewData);
    setActiveStep(4);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <ImportTypeStep
            selectedType={importType}
            onTypeSelect={handleTypeSelect}
            error={error}
          />
        );
      case 1:
        return (
          <FileUploadStep
            type={importType!}
            onFileSelect={handleFileSelect}
            error={error}
          />
        );
      case 2:
        return (
          <ImportSettingsStep
            settings={settings}
            onSettingsChange={handleSettingsChange}
            error={error}
          />
        );
      case 3:
        return preview ? (
          <PreviewStep
            fileId={preview.fileId}
            onPreviewComplete={handlePreviewComplete}
          />
        ) : null;
      case 4:
        return job ? (
          <ImportProgress
            jobId={job.id}
            onComplete={handleComplete}
            onError={handleError}
            onCancel={handleCancel}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Импорт данных
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {renderStep()}

      {activeStep === 3 && preview && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartImport}
            disabled={isLoading || preview.errors.length > 0}
          >
            Начать импорт
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImportPage; 