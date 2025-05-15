import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import BusinessIcon from '@mui/icons-material/Business';
import { ImportType } from '../../types/import';

interface ImportTypeStepProps {
  onSelect: (type: ImportType) => void;
  selectedType: ImportType | null;
}

interface ImportTypeOption {
  type: ImportType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const importTypes: ImportTypeOption[] = [
  {
    type: ImportType.EMPLOYEES,
    title: 'Сотрудники',
    description: 'Импорт данных о сотрудниках',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />
  },
  {
    type: ImportType.EQUIPMENT,
    title: 'Оборудование',
    description: 'Импорт данных об оборудовании',
    icon: <DevicesIcon sx={{ fontSize: 40 }} />
  },
  {
    type: ImportType.COMPANIES,
    title: 'Организации',
    description: 'Импорт данных об организациях',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />
  }
];

const ImportTypeStep: React.FC<ImportTypeStepProps> = ({ onSelect, selectedType }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выберите тип импорта
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Выберите тип данных, которые вы хотите импортировать
      </Typography>

      <Grid container spacing={3}>
        {importTypes.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.type}>
            <Card 
              sx={{ 
                height: '100%',
                border: selectedType === option.type ? 2 : 0,
                borderColor: 'primary.main'
              }}
            >
              <CardActionArea
                onClick={() => onSelect(option.type)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    {option.icon}
                    <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImportTypeStep; 