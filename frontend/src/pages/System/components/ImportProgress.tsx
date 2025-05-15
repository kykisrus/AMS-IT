import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import { ImportJob, ImportStatus } from '../../../types/import';
import { importService } from '../../../services/importService';

interface ImportProgressProps {
  jobId: string;
  onComplete?: () => void;
}

const ImportProgress: React.FC<ImportProgressProps> = ({ jobId, onComplete }) => {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  const updateStatus = async () => {
    try {
      const updatedJob = await importService.getStatus(jobId);
      setJob(updatedJob);

      if (updatedJob.status === ImportStatus.COMPLETED && onComplete) {
        onComplete();
      }
    } catch (err) {
      setError('Ошибка при получении статуса импорта');
      console.error(err);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await importService.getReport(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-report-${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Ошибка при скачивании отчета');
      console.error(err);
    }
  };

  if (!job) {
    return <Typography>Загрузка...</Typography>;
  }

  const progress = job.totalRows > 0 
    ? Math.round((job.processedRows / job.totalRows) * 100)
    : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Прогресс импорта
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Статус: {job.status}
        </Typography>
        {job.currentOperation && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Текущая операция: {job.currentOperation}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Обработано строк: {job.processedRows} из {job.totalRows}
        </Typography>
        {job.failedRows > 0 && (
          <Typography variant="body2" color="error">
            Ошибок: {job.failedRows}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {job.status === ImportStatus.IN_PROGRESS && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {/* TODO: Implement cancel */}}
          >
            Отменить
          </Button>
        )}
        {job.status === ImportStatus.COMPLETED && (
          <Button
            variant="outlined"
            onClick={handleDownloadReport}
          >
            Скачать отчет
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ImportProgress; 