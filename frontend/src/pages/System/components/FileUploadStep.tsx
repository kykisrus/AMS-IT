import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ImportType } from '../../../types/import';

interface FileUploadStepProps {
  onUpload: (file: File) => void;
  type: ImportType;
  maxFileSize?: number; // в байтах
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onUpload,
  type,
  maxFileSize = 10 * 1024 * 1024 // 10MB по умолчанию
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = (file: File): boolean => {
    // Проверка размера файла
    if (file.size > maxFileSize) {
      setError(`Размер файла превышает ${maxFileSize / 1024 / 1024}MB`);
      return false;
    }

    // Проверка типа файла
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Поддерживаются только файлы CSV');
      return false;
    }

    return true;
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `Файл слишком большой. Максимальный размер: ${maxFileSize / 1024 / 1024}MB`;
        }
        if (rejection.errors[0].code === 'file-invalid-type') {
          return 'Поддерживаются только файлы CSV';
        }
        return rejection.errors[0].message;
      });
      setError(errors.join('\n'));
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsValidating(true);
    try {
      await onUpload(file);
    } finally {
      setIsValidating(false);
    }
  }, [maxFileSize, onUpload]);

  const accept: Accept = {
    'text/csv': ['.csv']
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
    disabled: isValidating,
    maxSize: maxFileSize,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
  });

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
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.500',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: isValidating ? 'default' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: isValidating ? 'background.paper' : 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} type="file" accept=".csv" />
        {isValidating ? (
          <CircularProgress size={40} />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Отпустите файл здесь' : 'Перетащите файл сюда или нажмите для выбора'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Поддерживаются только CSV файлы
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