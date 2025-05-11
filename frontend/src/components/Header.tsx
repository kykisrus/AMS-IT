import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { getUser, logout } = useAuth();
  const user = getUser();

  return (
    <AppBar position="static" sx={{ bgcolor: '#fff', color: '#22304a', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div">
          Home Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountCircle sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="body1" sx={{ mr: 2 }}>{user?.full_name || user?.username || 'Пользователь'}</Typography>
          <Button variant="outlined" color="primary" onClick={logout} size="small">Выйти</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 