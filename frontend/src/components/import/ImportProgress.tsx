import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Alert,
  Button
} from '@mui/material';
import {
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { importService } from '../../api/services/importService';
import { ImportJob, ImportError } from '../../types/import';

export interface ImportProgressProps {
  jobId: string;
  onComplete: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  jobId,
  onComplete,
  onError,
  onCancel
}) => {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobStatus = async () => {
      try {
        const jobData = await importService.getJobStatus(jobId);
        setJob(jobData);

        if (jobData.status === 'completed') {
          onComplete();
        } else if (jobData.status === 'failed') {
          setError(jobData.error || 'Импорт завершился с ошибкой');
          onError(jobData.error || 'Импорт завершился с ошибкой');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка получения статуса импорта';
        setError(errorMessage);
        onError(errorMessage);
      }
    };

    const interval = setInterval(fetchJobStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId, onComplete, onError]);

  if (!job) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  const progress = job.totalRecords > 0
    ? Math.round((job.processedRecords / job.totalRecords) * 100)
    : 0;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Импорт {job.type === 'employees' ? 'сотрудников' : 'техники'}
          </Typography>
          <IconButton onClick={onCancel} disabled={job.status === 'completed'}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Прогресс: {progress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.processedRecords} из {job.totalRecords}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {job.errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Ошибки ({job.errors.length})
            </Typography>
            <List dense>
              {job.errors.map((error: ImportError, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={error.message}
                    secondary={`Строка ${error.row}, Колонка ${error.column}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Статус: {job.status}
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {job.status === 'completed' ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={onComplete}
          >
            Завершить
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => importService.cancelImport(jobId)}
          >
            Отменить
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ImportProgress; 