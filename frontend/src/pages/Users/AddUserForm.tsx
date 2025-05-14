import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Alert } from '@mui/material';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: {
    id: number;
    full_name: string;
    email: string;
    login: string;
    role: string;
  } | null;
}

const roleOptions = [
  { value: 'super_admin', label: 'Супер-администратор' },
  { value: 'it', label: 'IT специалист' },
  { value: 'accountant', label: 'Бухгалтер' },
  { value: 'repair_commission', label: 'Ремонтная комиссия' },
  { value: 'mol', label: 'Материально-ответственное лицо' },
];

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess, onCancel, initialValues }) => {
  const { token } = useAuth();
  const [fullName, setFullName] = useState(initialValues?.full_name || '');
  const [login, setLogin] = useState(initialValues?.login || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [role, setRole] = useState(initialValues?.role || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFullName(initialValues.full_name || '');
      setLogin(initialValues.login || '');
      setEmail(initialValues.email || '');
      setRole(initialValues.role || '');
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName || !login || !email || !role || (!initialValues && !password)) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload: any = { full_name: fullName, login, email, role };
      if (!initialValues) payload.password = password;

      if (initialValues) {
        await axios.put(`/api/users/${initialValues.id}`, payload, { headers });
      } else {
        await axios.post('/api/users', payload, { headers });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка при сохранении пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Редактировать пользователя' : 'Добавить пользователя'}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="ФИО"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Логин"
        value={login}
        onChange={e => setLogin(e.target.value)}
        required
        fullWidth
        inputProps={{ minLength: 3 }}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        fullWidth
      />
      <TextField
        select
        label="Роль"
        value={role}
        onChange={e => setRole(e.target.value)}
        required
        fullWidth
      >
        {roleOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {!initialValues && (
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          fullWidth
        />
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {initialValues ? 'Сохранить' : 'Создать'}
        </Button>
        <Button onClick={onCancel} variant="outlined" color="secondary" fullWidth disabled={loading}>
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default AddUserForm; 