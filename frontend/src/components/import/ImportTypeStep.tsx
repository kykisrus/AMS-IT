import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { ImportType } from '../../types/import';

export interface ImportTypeStepProps {
  selectedType: ImportType | null;
  onTypeSelect: (type: ImportType) => void;
  error: string | null;
}

const importTypes = [
  {
    type: 'employees' as ImportType,
    title: 'Сотрудники',
    description: 'Импорт данных о сотрудниках',
    icon: PeopleIcon
  },
  {
    type: 'departments' as ImportType,
    title: 'Подразделения',
    description: 'Импорт структуры подразделений',
    icon: BusinessIcon
  },
  {
    type: 'positions' as ImportType,
    title: 'Должности',
    description: 'Импорт должностей и штатных единиц',
    icon: WorkIcon
  },
  {
    type: 'documents' as ImportType,
    title: 'Документы',
    description: 'Импорт документов и файлов',
    icon: DescriptionIcon
  }
];

const ImportTypeStep: React.FC<ImportTypeStepProps> = ({ selectedType, onTypeSelect, error }) => {
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Выберите тип импортируемых данных
      </Typography>

      <Grid container spacing={3}>
        {importTypes.map(({ type, title, description, icon: Icon }) => (
          <Grid item xs={12} sm={6} md={3} key={type}>
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
                      <Icon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {description}
                    </Typography>
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