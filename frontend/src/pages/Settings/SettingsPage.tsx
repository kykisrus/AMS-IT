import React from 'react';
import { Card, Typography } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Card>
      <Typography variant="h5" component="h1" gutterBottom>
        Настройки системы
      </Typography>
      {/* Здесь будут настройки системы */}
    </Card>
  );
};

export default SettingsPage; 