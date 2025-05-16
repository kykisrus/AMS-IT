import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { ImportJob } from '../../../types/import';
import { importService } from '../../../api/services/importService';

interface ImportProgressProps {
  jobId: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  jobId,
  onComplete,
  onError
}) => {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProgress = async () => {
    try {
        const updatedJob = await importService.getJobStatus(jobId);
      setJob(updatedJob);

        if (updatedJob.status === 'completed' && onComplete) {
        onComplete();
        } else if (updatedJob.status === 'failed') {
          setError('Импорт завершился с ошибкой');
          if (onError) {
            onError(new Error('Импорт завершился с ошибкой'));
          }
        } else if (
          updatedJob.status === 'pending' ||
          updatedJob.status === 'processing'
        ) {
          setTimeout(checkProgress, 2000);
      }
    } catch (err) {
        setError('Ошибка при проверке статуса импорта');
        if (onError) {
          onError(err as Error);
    }
      }
    };

    checkProgress();
  }, [jobId, onComplete, onError]);

  const handleDownloadReport = async () => {
    try {
      const response = await importService.downloadReport(jobId);
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `import-report-${jobId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании отчета:', error);
    }
  };

  if (!job) {
    return <Typography>Загрузка...</Typography>;
  }

  const progress = job.totalRecords > 0 
    ? Math.round((job.processedRecords / job.totalRecords) * 100)
    : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Прогресс импорта
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Обработано {job.processedRecords} из {job.totalRecords} записей
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {job.status === 'processing' && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => importService.cancelImport(jobId)}
          >
            Отменить
          </Button>
        )}
        {job.status === 'completed' && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
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