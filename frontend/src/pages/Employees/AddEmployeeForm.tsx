import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Alert } from '@mui/material';
import axios from 'axios';

interface Manager {
  id: number;
  full_name: string;
}

interface Company {
  id: number;
  name: string;
}

interface AddEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess, onCancel }) => {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [managerId, setManagerId] = useState<string>('');
  const [managers, setManagers] = useState<Manager[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchManagers();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка организаций');
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/users/managers');
      setManagers(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка руководителей');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!fullName || !position || !companyId) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }
    try {
      const payload = {
        full_name: fullName,
        position,
        company_id: Number(companyId),
        manager_id: managerId === '' ? null : Number(managerId)
      };
      await axios.post('/api/employees', payload);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка при добавлении сотрудника');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Добавить сотрудника
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
        label="Должность"
        value={position}
        onChange={e => setPosition(e.target.value)}
        required
        fullWidth
      />
      <TextField
        select
        label="Организация"
        value={companyId}
        onChange={e => setCompanyId(e.target.value)}
        required
        fullWidth
      >
        {companies.map(company => (
          <MenuItem key={company.id} value={company.id.toString()}>
            {company.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Руководитель"
        value={managerId}
        onChange={e => setManagerId(e.target.value)}
        fullWidth
      >
        <MenuItem value="">Нет руководителя</MenuItem>
        {managers.map(manager => (
          <MenuItem key={manager.id} value={manager.id.toString()}>
            {manager.full_name}
          </MenuItem>
        ))}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          Добавить
        </Button>
        <Button onClick={onCancel} variant="outlined" color="secondary" fullWidth disabled={loading}>
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default AddEmployeeForm; 