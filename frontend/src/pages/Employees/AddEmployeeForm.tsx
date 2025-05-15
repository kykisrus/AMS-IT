import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Alert } from '@mui/material';
import api from '../../utils/axios';

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
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    companyId: '',
    managerId: '',
    phone: '',
    glpiId: '',
    bitrixId: '',
  });
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
      const response = await api.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка организаций');
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/api/users/managers');
      setManagers(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка руководителей');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.lastName || !formData.firstName || !formData.position || !formData.companyId) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        last_name: formData.lastName,
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        position: formData.position,
        company_id: Number(formData.companyId),
        manager_id: formData.managerId ? Number(formData.managerId) : null,
        phone: formData.phone || null,
        glpi_id: formData.glpiId || null,
        bitrix_id: formData.bitrixId || null,
        hire_date: new Date().toISOString().split('T')[0]
      };

      await api.post('/api/employees', payload);
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
        label="Фамилия"
        value={formData.lastName}
        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
        required
        fullWidth
      />
      
      <TextField
        label="Имя"
        value={formData.firstName}
        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
        required
        fullWidth
      />
      
      <TextField
        label="Отчество"
        value={formData.middleName}
        onChange={e => setFormData({ ...formData, middleName: e.target.value })}
        fullWidth
      />
      
      <TextField
        label="Должность"
        value={formData.position}
        onChange={e => setFormData({ ...formData, position: e.target.value })}
        required
        fullWidth
      />
      
      <TextField
        select
        label="Организация"
        value={formData.companyId}
        onChange={e => setFormData({ ...formData, companyId: e.target.value })}
        required
        fullWidth
      >
        {companies.map(company => (
          <MenuItem key={company.id} value={company.id}>
            {company.name}
          </MenuItem>
        ))}
      </TextField>
      
      <TextField
        select
        label="Руководитель"
        value={formData.managerId}
        onChange={e => setFormData({ ...formData, managerId: e.target.value })}
        fullWidth
      >
        <MenuItem value="">Нет руководителя</MenuItem>
        {managers.map(manager => (
          <MenuItem key={manager.id} value={manager.id}>
            {manager.full_name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Телефон"
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        fullWidth
      />

      <TextField
        label="ID сотрудника в GLPI"
        value={formData.glpiId}
        onChange={e => setFormData({ ...formData, glpiId: e.target.value })}
        fullWidth
      />

      <TextField
        label="ID сотрудника в Битрикс"
        value={formData.bitrixId}
        onChange={e => setFormData({ ...formData, bitrixId: e.target.value })}
        fullWidth
      />

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