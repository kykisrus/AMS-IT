import React from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import { ImportType } from '../../../types/import';
import { importService } from '../../../api/services/importService';

interface ImportTypeOption {
  type: ImportType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const importTypes: ImportTypeOption[] = [
  {
    type: 'equipment',
    title: 'Техника',
    description: 'Импорт списка оборудования с характеристиками',
    icon: <ComputerIcon sx={{ fontSize: 40 }} />
  },
  {
    type: 'employees',
    title: 'Сотрудники',
    description: 'Импорт списка сотрудников с данными',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />
  }
];

interface ImportTypeStepProps {
  selectedType: ImportType | null;
  onTypeSelect: (type: ImportType) => void;
  error?: string | null;
}

const ImportTypeStep: React.FC<ImportTypeStepProps> = ({ selectedType, onTypeSelect, error }) => {
  const handleDownloadTemplate = async (type: ImportType) => {
    try {
      const response = await importService.downloadTemplate(type);
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании шаблона:', error);
    }
  };

  return (
    <Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Typography variant="h6" gutterBottom>
        Выберите тип импортируемых данных
      </Typography>

      <Grid container spacing={3}>
        {importTypes.map(({ type, title, description, icon }) => (
          <Grid item xs={12} sm={6} key={type}>
            <Tooltip title={description}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  bgcolor: selectedType === type ? 'action.selected' : 'background.paper'
                }}
              >
                <CardActionArea onClick={() => onTypeSelect(type)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      {icon}
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        startIcon={<DownloadIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadTemplate(type);
                        }}
                        size="small"
                      >
                        Скачать шаблон
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImportTypeStep; 