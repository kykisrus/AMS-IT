import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasUsers, setHasUsers] = useState(true);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка, есть ли уже пользователи в системе
    const checkUsers = async () => {
      try {
        const response = await axios.get('/api/auth/check-users');
        setHasUsers(response.data.hasUsers);
        
        // Если пользователей нет, перенаправляем на страницу регистрации
        if (!response.data.hasUsers) {
          navigate('/register');
        }
      } catch (err) {
        console.error('Error checking users:', err);
      }
    };

    checkUsers();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authLogin(email, password);
      navigate('/users');
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/logo.png" alt="Логотип" style={{ width: '100%', maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
        </Box>
        <Typography variant="h5" component="h1" gutterBottom>
          Вход в систему
        </Typography>
        
        {error && <Alert severity="error">{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email или логин"
            type="text"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Войти
          </Button>
          
          {!hasUsers && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                В системе нет пользователей.{' '}
                <MuiLink component={Link} to="/register">
                  Зарегистрировать первого пользователя
                </MuiLink>
              </Typography>
            </Box>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 