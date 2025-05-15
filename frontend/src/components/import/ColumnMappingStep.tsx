import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  Alert,
  FormControl
} from '@mui/material';
import { ImportType, ColumnMapping, DbColumn } from '../../types/import';
import { importService } from '../../services/importService';

interface ColumnMappingStepProps {
  fileId: string;
  type: ImportType;
  onComplete: (mapping: ColumnMapping[]) => void;
}

const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({
  fileId,
  type,
  onComplete
}) => {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [dbColumns, setDbColumns] = useState<DbColumn[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [fileId, type]);

  const loadData = async () => {
    try {
      // Загрузка структуры таблицы
      const columns = await importService.getColumns(type);
      setDbColumns(columns);

      // Загрузка заголовков из файла
      const preview = await importService.getPreview(fileId);
      setCsvHeaders(preview.headers);

      // Инициализация маппинга
      const initialMapping = columns.map(column => ({
        csvHeader: '',
        dbField: column.name,
        required: column.required,
        type: column.type
      }));
      setMapping(initialMapping);
    } catch (err) {
      setError('Ошибка при загрузке данных');
      console.error(err);
    }
  };

  const handleMappingChange = (dbField: string, csvHeader: string) => {
    setMapping(prev => prev.map(m => 
      m.dbField === dbField ? { ...m, csvHeader } : m
    ));
  };

  const handleSubmit = () => {
    // Проверка обязательных полей
    const missingRequired = mapping.filter(m => 
      m.required && !m.csvHeader
    );

    if (missingRequired.length > 0) {
      setError(`Не заполнены обязательные поля: ${missingRequired.map(m => m.dbField).join(', ')}`);
      return;
    }

    onComplete(mapping);
  };

  if (!csvHeaders.length || !dbColumns.length) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Сопоставление колонок
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Сопоставьте колонки из вашего файла с полями в системе
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Поле в системе</TableCell>
              <TableCell>Колонка в файле</TableCell>
              <TableCell>Тип данных</TableCell>
              <TableCell>Обязательное</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mapping.map(map => {
              const dbColumn = dbColumns.find(c => c.name === map.dbField);
              return (
                <TableRow key={map.dbField}>
                  <TableCell>{dbColumn?.label || map.dbField}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={map.csvHeader}
                        onChange={(e) => handleMappingChange(map.dbField, e.target.value as string)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Не выбрано</em>
                        </MenuItem>
                        {csvHeaders.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{dbColumn?.type}</TableCell>
                  <TableCell>{map.required ? 'Да' : 'Нет'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!mapping.some(m => m.csvHeader)}
        >
          Продолжить
        </Button>
      </Box>
    </Box>
  );
};

export default ColumnMappingStep; 