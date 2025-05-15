import React, { useState, useEffect } from 'react';
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
  FormControl,
  Alert,
  Chip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface ColumnMappingStepProps {
  csvHeaders: string[];
  dbColumns: {
    name: string;
    label: string;
    required: boolean;
    type: string;
  }[];
  onMappingChange: (mapping: { [key: string]: string }) => void;
}

const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({
  csvHeaders,
  dbColumns,
  onMappingChange
}) => {
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    validateMapping();
  }, [mapping]);

  const handleMappingChange = (csvHeader: string, dbColumn: string) => {
    const newMapping = {
      ...mapping,
      [csvHeader]: dbColumn
    };
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  const validateMapping = () => {
    const newErrors: string[] = [];
    
    // Проверка обязательных полей
    const mappedDbColumns = Object.values(mapping);
    const requiredColumns = dbColumns.filter(col => col.required);
    
    for (const reqCol of requiredColumns) {
      if (!mappedDbColumns.includes(reqCol.name)) {
        newErrors.push(`Обязательное поле "${reqCol.label}" не сопоставлено`);
      }
    }

    // Проверка дубликатов
    const duplicates = mappedDbColumns.filter(
      (col, index) => mappedDbColumns.indexOf(col) !== index
    );
    
    if (duplicates.length > 0) {
      newErrors.push('Обнаружены дублирующиеся сопоставления');
    }

    setErrors(newErrors);
  };

  const getColumnTypeChip = (type: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (type) {
      case 'string':
        color = 'primary';
        break;
      case 'number':
        color = 'secondary';
        break;
      case 'date':
        color = 'info';
        break;
      case 'enum':
        color = 'warning';
        break;
    }

    return (
      <Chip
        label={type}
        size="small"
        color={color}
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Сопоставление полей
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Сопоставьте поля из CSV файла с полями базы данных. Обязательные поля отмечены звездочкой (*).
      </Typography>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Поле CSV файла</TableCell>
              <TableCell>Поле базы данных</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {csvHeaders.map((header) => (
              <TableRow key={header}>
                <TableCell>{header}</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={mapping[header] || ''}
                      onChange={(event: SelectChangeEvent) => {
                        handleMappingChange(header, event.target.value);
                      }}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Не выбрано</em>
                      </MenuItem>
                      {dbColumns.map((column) => (
                        <MenuItem
                          key={column.name}
                          value={column.name}
                          disabled={
                            Object.values(mapping).includes(column.name) &&
                            mapping[header] !== column.name
                          }
                        >
                          {column.label}
                          {column.required && ' *'}
                          {getColumnTypeChip(column.type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ColumnMappingStep; 