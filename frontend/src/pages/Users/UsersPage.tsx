import React from 'react';
import { Card, Typography } from '@mui/material';

const UsersPage: React.FC = () => {
  return (
    <Card>
      <Typography variant="h5" component="h1" gutterBottom>
        Пользователи системы
      </Typography>
      {/* Здесь будет таблица пользователей */}
    </Card>
  );
};

export default UsersPage; 