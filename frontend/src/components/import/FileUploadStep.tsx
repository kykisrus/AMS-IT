import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ImportType } from '../../types/import';

interface FileUploadStepProps {
  onUpload: (file: File) => void;
  type: ImportType;
  maxFileSize?: number;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onUpload,
  type,
  maxFileSize = 10 * 1024 * 1024 // 10MB по умолчанию
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      setError(`Размер файла превышает ${maxFileSize / 1024 / 1024}MB`);
      return false;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Поддерживаются только файлы CSV');
      return false;
    }

    return true;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setIsValidating(true);

    try {
      const file = acceptedFiles[0];
      
      if (!validateFile(file)) {
        return;
      }

      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        setError('Файл пуст или не содержит данных');
        return;
      }

      const headers = lines[0].trim().split(',');
      if (headers.length === 0) {
        setError('Файл не содержит заголовки');
        return;
      }

      onUpload(file);
    } catch (err) {
      setError('Ошибка при чтении файла');
    } finally {
      setIsValidating(false);
    }
  }, [maxFileSize, onUpload]);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDragOver: () => {}
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Загрузка файла
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Загрузите CSV файл с данными для импорта. Файл должен соответствовать формату шаблона.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        
        {isValidating ? (
          <CircularProgress size={40} />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Отпустите файл здесь'
                : 'Перетащите файл сюда или нажмите для выбора'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Поддерживаются только CSV файлы размером до {maxFileSize / 1024 / 1024}MB
            </Typography>
          </>
        )}
      </Paper>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          component="a"
          href={`/api/import/templates/${type}`}
          download
          sx={{ mt: 2 }}
        >
          Скачать шаблон
        </Button>
      </Box>
    </Box>
  );
};

export default FileUploadStep; 