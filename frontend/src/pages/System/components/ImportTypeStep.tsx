import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import BusinessIcon from '@mui/icons-material/Business';
import DownloadIcon from '@mui/icons-material/Download';
import { ImportType } from '../../../api/types/import';
import { importService } from '../../../api/services/importService';

interface ImportTypeOption {
  id: ImportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  templateUrl: string;
}

const importTypes: ImportTypeOption[] = [
  {
    id: 'employees',
    title: 'Сотрудники',
    description: 'Импорт данных о сотрудниках: ФИО, должность, отдел и другая информация',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    templateUrl: '/templates/employees_template.csv'
  },
  {
    id: 'equipment',
    title: 'Оборудование',
    description: 'Импорт данных об оборудовании: инвентарные номера, модели, характеристики',
    icon: <DevicesIcon sx={{ fontSize: 40 }} />,
    templateUrl: '/templates/equipment_template.csv'
  },
  {
    id: 'companies',
    title: 'Компании',
    description: 'Импорт данных о компаниях: названия, реквизиты, контактная информация',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    templateUrl: '/templates/companies_template.csv'
  }
];

interface ImportTypeStepProps {
  onSelect: (type: ImportType) => void;
  selectedType: ImportType | null;
}

const ImportTypeStep: React.FC<ImportTypeStepProps> = ({ onSelect, selectedType }) => {
  const handleDownloadTemplate = async (type: ImportType) => {
    try {
      const blob = await importService.downloadTemplate(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Ошибка при скачивании шаблона:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выберите тип данных для импорта
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Выберите тип данных, которые вы хотите импортировать. Для каждого типа доступен шаблон CSV файла.
      </Typography>

      <Grid container spacing={3}>
        {importTypes.map((type) => (
          <Grid item xs={12} md={4} key={type.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                border: selectedType === type.id ? 2 : 1,
                borderColor: selectedType === type.id ? 'primary.main' : 'divider'
              }}
              onClick={() => onSelect(type.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {type.icon}
                  <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {type.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {type.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadTemplate(type.id);
                  }}
                >
                  Скачать шаблон
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImportTypeStep; 