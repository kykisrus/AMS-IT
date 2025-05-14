import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

interface RoleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    is_manager?: boolean;
    is_mol?: boolean;
  } | null;
}

const permissionsList = [
  { value: 'is_manager', label: 'Является руководителем' },
  { value: 'is_mol', label: 'Может быть МОЛ' },
  { value: 'users.view', label: 'Просмотр пользователей' },
  { value: 'users.create', label: 'Создание пользователей' },
  { value: 'users.edit', label: 'Редактирование пользователей' },
  { value: 'users.delete', label: 'Удаление пользователей' },
  { value: 'roles.view', label: 'Просмотр ролей' },
  { value: 'roles.create', label: 'Создание ролей' },
  { value: 'roles.edit', label: 'Редактирование ролей' },
  { value: 'roles.delete', label: 'Удаление ролей' },
];

const RoleForm: React.FC<RoleFormProps> = ({ onSuccess, onCancel, initialValues }) => {
  const { token } = useAuth();
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [permissions, setPermissions] = useState<string[]>(initialValues?.permissions || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissionsTouched, setPermissionsTouched] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setDescription(initialValues.description || '');
      setPermissions(initialValues.permissions || []);
    }
  }, [initialValues]);

  const handlePermissionChange = (perm: string) => {
    setPermissionsTouched(true);
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!name || !description || permissions.length === 0) {
      setError('Пожалуйста, заполните все поля и выберите хотя бы одно разрешение');
      setPermissionsTouched(true);
      setLoading(false);
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { name, description, permissions };
      if (initialValues) {
        await axios.put(`/api/roles/${initialValues.id}`, payload, { headers });
      } else {
        await axios.post('/api/roles', payload, { headers });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка при сохранении роли');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Редактировать роль' : 'Добавить роль'}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Название"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Описание"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        fullWidth
        multiline
        rows={3}
      />
      <FormGroup
        sx={{
          border: permissionsTouched && permissions.length === 0 ? '1px solid #d32f2f' : undefined,
          borderRadius: 1,
          p: 1,
        }}
      >
        {permissionsList.map((perm) => (
          <FormControlLabel
            key={perm.value}
            control={
              <Checkbox
                checked={permissions.includes(perm.value)}
                onChange={() => handlePermissionChange(perm.value)}
                value={perm.value}
              />
            }
            label={perm.label}
          />
        ))}
      </FormGroup>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || permissions.length === 0}>
          {initialValues ? 'Сохранить' : 'Создать'}
        </Button>
        <Button onClick={onCancel} variant="outlined" color="secondary" fullWidth disabled={loading}>
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default RoleForm; 