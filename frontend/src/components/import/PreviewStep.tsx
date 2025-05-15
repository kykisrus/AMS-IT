import React from 'react';
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
  Button
} from '@mui/material';
import { ImportPreview } from '../../types/import';

interface PreviewStepProps {
  preview: ImportPreview;
  onConfirm: () => void;
  onBack: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ preview, onConfirm, onBack }) => {
  const { headers, rows, validationResults, stats } = preview;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Предпросмотр данных
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Статистика
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Всего строк
            </Typography>
            <Typography variant="h6">{stats.totalRows}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Валидных строк
            </Typography>
            <Typography variant="h6" color="success.main">
              {stats.validRows}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Невалидных строк
            </Typography>
            <Typography variant="h6" color="error.main">
              {stats.invalidRows}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Дубликатов
            </Typography>
            <Typography variant="h6" color="warning.main">
              {stats.duplicates}
            </Typography>
          </Box>
        </Box>
      </Box>

      {validationResults.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Обнаружены проблемы с данными. Проверьте список ошибок ниже.
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Ошибки валидации
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Строка</TableCell>
                <TableCell>Колонка</TableCell>
                <TableCell>Значение</TableCell>
                <TableCell>Сообщение</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validationResults.map((error, index) => (
                <TableRow key={index}>
                  <TableCell>{error.row}</TableCell>
                  <TableCell>{error.column}</TableCell>
                  <TableCell>{error.value}</TableCell>
                  <TableCell>{error.message}</TableCell>
                </TableRow>
              ))}
              {validationResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Ошибок не найдено
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Данные
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={header}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 5 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Показаны первые 5 строк из {rows.length}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>Назад</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={stats.invalidRows > 0}
        >
          Продолжить
        </Button>
      </Box>
    </Paper>
  );
};

export default PreviewStep; 