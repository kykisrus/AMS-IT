import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary', height: 64, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          disabled
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AMS IT System
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.full_name || user?.login}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ textTransform: 'none' }}
            >
              Выйти
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 