import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roles = [
  { value: 'super_admin', label: 'Супер-админ' },
  { value: 'it_specialist', label: 'ИТ-специалист' },
  { value: 'mol', label: 'МОЛ' },
  { value: 'accountant', label: 'Бухгалтер' },
  { value: 'repair_commission', label: 'Комиссия по ремонту' },
  { value: 'inventory_commission', label: 'Инвентаризационная комиссия' }
];

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'super_admin'
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Неверный логин или пароль');
    }
  };

  const handleRegister = async () => {
    setRegError('');
    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      setRegLoading(false);
      if (!res.ok) {
        setRegError(data.error || 'Ошибка регистрации');
        return;
      }
      // Автоматический вход после регистрации
      const loginSuccess = await login(regForm.username, regForm.password);
      if (loginSuccess) {
        setRegisterOpen(false);
      } else {
        setRegError('Пользователь создан, но не удалось войти. Войдите вручную.');
      }
    } catch (e) {
      setRegLoading(false);
      setRegError('Ошибка сети');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6fa' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2} align="center">Вход в систему</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Войти
          </Button>
        </form>
        <Button variant="text" color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => setRegisterOpen(true)}>
          Регистрация
        </Button>
      </Paper>
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Регистрация первого пользователя</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Логин" value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))} required fullWidth />
          <TextField label="Пароль" type="password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} required fullWidth />
          <TextField label="Email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required fullWidth />
          <TextField label="ФИО" value={regForm.full_name} onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))} required fullWidth />
          <TextField label="Роль" select value={regForm.role} onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))} fullWidth>
            {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </TextField>
          {regError && <Typography color="error" variant="body2">{regError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterOpen(false)}>Отмена</Button>
          <Button onClick={handleRegister} variant="contained" disabled={regLoading}>Зарегистрироваться</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 