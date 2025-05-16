import React, { useCallback, useState } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ImportType } from '../../types/import';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export interface FileUploadStepProps {
  type: ImportType;
  onFileSelect: (file: File) => void;
  error: string | null;
}

const acceptedFileTypes = {
  employees: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv']
  },
  departments: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv']
  },
  positions: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv']
  },
  documents: {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  }
};

const maxFileSize = 10 * 1024 * 1024; // 10MB

const FileUploadStep: React.FC<FileUploadStepProps> = ({ type, onFileSelect, error }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > maxFileSize) {
        return;
      }
      setIsLoading(true);
      onFileSelect(file);
      setIsLoading(false);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes[type],
    maxSize: maxFileSize,
    multiple: false
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Загрузите файл для импорта
      </Typography>

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
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Отпустите файл здесь' : 'Перетащите файл сюда или нажмите для выбора'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Поддерживаемые форматы: {Object.values(acceptedFileTypes[type])
                .flat()
                .join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Максимальный размер файла: 10MB
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FileUploadStep; 