import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Register: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('super_admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка, есть ли уже пользователи в системе
    const checkUsers = async () => {
      try {
        const response = await axios.get('/api/auth/check-users');
        setHasUsers(response.data.hasUsers);
        if (response.data.hasUsers) {
          // Если пользователи уже есть, перенаправляем на страницу входа
          navigate('/login');
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
    setLoading(true);

    if (!login || !password || !email || !fullName) {
      setError('Все поля должны быть заполнены');
      setLoading(false);
      return;
    }

    try {
      // Регистрация первого пользователя
      await axios.post('/api/auth/register', {
        login,
        password,
        email,
        full_name: fullName,
        role
      });

      // После успешной регистрации выполняем вход
      await authLogin(email, password);
      
      // Переходим на страницу пользователей
      navigate('/users');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Если пользователи уже есть, не показываем форму регистрации
  if (hasUsers) {
    return <Box>Перенаправление на страницу входа...</Box>;
  }

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
        <Typography variant="h5" component="h1" gutterBottom>
          Регистрация первого пользователя
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Создайте первого пользователя с правами администратора
        </Typography>
        
        {error && <Alert severity="error">{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="ФИО"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          
          <TextField
            label="Логин"
            fullWidth
            margin="normal"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          
          <TextField
            label="Email"
            type="email"
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
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Роль</InputLabel>
            <Select
              value={role}
              label="Роль"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="super_admin">Супер-администратор</MenuItem>
              <MenuItem value="it">IT специалист</MenuItem>
              <MenuItem value="accountant">Бухгалтер</MenuItem>
              <MenuItem value="repair_commission">Ремонтная комиссия</MenuItem>
              <MenuItem value="mol">Материально-ответственное лицо</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 