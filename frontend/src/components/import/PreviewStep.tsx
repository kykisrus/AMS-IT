import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { ImportPreview } from '../../types/import';
import { importService } from '../../services/importService';

export interface PreviewStepProps {
  fileId: string;
  onPreviewComplete: (preview: ImportPreview) => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ fileId, onPreviewComplete }) => {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        const data = await importService.getPreview(fileId);
        setPreview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки предпросмотра');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [fileId]);

  if (loading) {
    return <Typography>Загрузка предпросмотра...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!preview) {
    return <Typography>Нет данных для предпросмотра</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Предварительный просмотр данных
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Всего строк: {preview.totalRows}
      </Typography>

      {preview.errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Найдено {preview.errors.length} ошибок в данных
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {preview.headers.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {preview.rows.slice(0, 5).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {preview.headers.map((header, colIndex) => (
                  <TableCell key={colIndex}>{row[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {preview.rows.length > 5 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Показано 5 из {preview.rows.length} строк
        </Typography>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => onPreviewComplete(preview)}
        >
          Продолжить
        </Button>
      </Box>
    </Box>
  );
};

export default PreviewStep; 