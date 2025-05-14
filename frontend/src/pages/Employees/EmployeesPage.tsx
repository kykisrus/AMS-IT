import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../utils/axios';

interface Company {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  full_name: string;
  position: string;
  company: string;
  manager_id: number | null;
  manager_name: string | null;
  equipment: string[];
}

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<{ id: number; full_name: string }[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    company: '',
    manager_id: ''
  });
  const [managerError, setManagerError] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
    fetchCompanies();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Ошибка при загрузке списка сотрудников');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/users/managers');
      setManagers(response.data);
      setManagerError('');
    } catch (err) {
      setManagerError('Ошибка при загрузке списка руководителей');
      setManagers([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка организаций');
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        full_name: employee.full_name,
        position: employee.position,
        company: employee.company,
        manager_id: employee.manager_id?.toString() || ''
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        full_name: '',
        position: '',
        company: '',
        manager_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setFormData({
      full_name: '',
      position: '',
      company: '',
      manager_id: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEmployee) {
        await axios.put(`/api/employees/${selectedEmployee.id}`, formData);
      } else {
        await axios.post('/api/employees', formData);
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Ошибка при сохранении сотрудника');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      try {
        await axios.delete(`/api/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Ошибка при удалении сотрудника');
      }
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Сотрудники</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить сотрудника
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ФИО</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Организация</TableCell>
              <TableCell>Руководитель</TableCell>
              <TableCell>Оборудование</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.company}</TableCell>
                <TableCell>{employee.manager_name || '-'}</TableCell>
                <TableCell>{employee.equipment.join(', ') || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(employee)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(employee.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="ФИО"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Должность"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Организация"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              margin="normal"
              required
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.name}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Руководитель"
              value={formData.manager_id}
              onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              margin="normal"
              helperText={managerError || ''}
              error={!!managerError}
            >
              <MenuItem value="">Нет руководителя</MenuItem>
              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.full_name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained">
              {selectedEmployee ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage; 