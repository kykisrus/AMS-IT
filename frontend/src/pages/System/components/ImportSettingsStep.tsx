import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
  Radio,
  Slider,
  Switch,
  Paper,
  Grid,
  Divider
} from '@mui/material';

interface ImportSettings {
  duplicateHandling: 'skip' | 'update' | 'create_new';
  validationMode: 'strict' | 'soft';
  logLevel: 'basic' | 'detailed';
  batchSize: number;
  notifyOnComplete: boolean;
  skipEmptyValues: boolean;
}

interface ImportSettingsStepProps {
  settings: ImportSettings;
  onSettingsChange: (settings: ImportSettings) => void;
}

const ImportSettingsStep: React.FC<ImportSettingsStepProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleChange = (field: keyof ImportSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Настройки импорта
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Настройте параметры процесса импорта данных.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Обработка данных
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Обработка дубликатов
              </Typography>
              <RadioGroup
                value={settings.duplicateHandling}
                onChange={(e) => handleChange('duplicateHandling', e.target.value)}
              >
                <FormControlLabel
                  value="skip"
                  control={<Radio />}
                  label="Пропускать"
                />
                <FormControlLabel
                  value="update"
                  control={<Radio />}
                  label="Обновлять"
                />
                <FormControlLabel
                  value="create_new"
                  control={<Radio />}
                  label="Создавать новые"
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Режим валидации
              </Typography>
              <RadioGroup
                value={settings.validationMode}
                onChange={(e) => handleChange('validationMode', e.target.value)}
              >
                <FormControlLabel
                  value="strict"
                  control={<Radio />}
                  label="Строгий (прерывать при ошибках)"
                />
                <FormControlLabel
                  value="soft"
                  control={<Radio />}
                  label="Мягкий (пропускать ошибки)"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Дополнительные настройки
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Уровень логирования
              </Typography>
              <RadioGroup
                value={settings.logLevel}
                onChange={(e) => handleChange('logLevel', e.target.value)}
              >
                <FormControlLabel
                  value="basic"
                  control={<Radio />}
                  label="Базовый"
                />
                <FormControlLabel
                  value="detailed"
                  control={<Radio />}
                  label="Детальный"
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Размер пакета
              </Typography>
              <Slider
                value={settings.batchSize}
                onChange={(_, value) => handleChange('batchSize', value)}
                min={10}
                max={1000}
                step={10}
                marks={[
                  { value: 10, label: '10' },
                  { value: 500, label: '500' },
                  { value: 1000, label: '1000' }
                ]}
                valueLabelDisplay="auto"
              />
              <FormHelperText>
                Количество записей, обрабатываемых за один раз
              </FormHelperText>
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifyOnComplete}
                    onChange={(e) => handleChange('notifyOnComplete', e.target.checked)}
                  />
                }
                label="Уведомить о завершении"
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.skipEmptyValues}
                    onChange={(e) => handleChange('skipEmptyValues', e.target.checked)}
                  />
                }
                label="Пропускать пустые значения"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportSettingsStep; 