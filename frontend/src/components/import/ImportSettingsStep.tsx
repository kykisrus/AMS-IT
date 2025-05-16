import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Switch,
  Alert,
  Grid
} from '@mui/material';
import { ImportSettings } from '../../types/import';

export interface ImportSettingsStepProps {
  settings: ImportSettings;
  onSettingsChange: (settings: ImportSettings) => void;
  error: string | null;
}

const ImportSettingsStep: React.FC<ImportSettingsStepProps> = ({
  settings,
  onSettingsChange,
  error
}) => {
  const handleChange = (field: keyof ImportSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Настройки импорта
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Обработка дубликатов
            </Typography>
            <RadioGroup
              value={settings.duplicateHandling}
              onChange={handleChange('duplicateHandling')}
            >
              <FormControlLabel
                value="skip"
                control={<Radio />}
                label="Пропускать дубликаты"
              />
              <FormControlLabel
                value="update"
                control={<Radio />}
                label="Обновлять существующие записи"
              />
              <FormControlLabel
                value="error"
                control={<Radio />}
                label="Выдавать ошибку"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Режим валидации
            </Typography>
            <RadioGroup
              value={settings.validationMode}
              onChange={handleChange('validationMode')}
            >
              <FormControlLabel
                value="strict"
                control={<Radio />}
                label="Строгий (остановка при ошибках)"
              />
              <FormControlLabel
                value="warn"
                control={<Radio />}
                label="Предупреждения (продолжать с ошибками)"
              />
              <FormControlLabel
                value="skip"
                control={<Radio />}
                label="Пропускать невалидные записи"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Уровень логирования
            </Typography>
            <RadioGroup
              value={settings.logLevel}
              onChange={handleChange('logLevel')}
            >
              <FormControlLabel
                value="basic"
                control={<Radio />}
                label="Базовый (только ошибки)"
              />
              <FormControlLabel
                value="detailed"
                control={<Radio />}
                label="Подробный (все изменения)"
              />
              <FormControlLabel
                value="debug"
                control={<Radio />}
                label="Отладочный (вся информация)"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Размер пакета"
            value={settings.batchSize}
            onChange={handleChange('batchSize')}
            inputProps={{ min: 1, max: 1000 }}
            helperText="Количество записей для обработки за один раз"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.skipEmptyValues}
                onChange={handleChange('skipEmptyValues')}
              />
            }
            label="Пропускать пустые значения"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnComplete}
                onChange={handleChange('notifyOnComplete')}
              />
            }
            label="Уведомлять о завершении"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportSettingsStep; 