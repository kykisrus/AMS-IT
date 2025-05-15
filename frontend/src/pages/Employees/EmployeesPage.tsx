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
import AddEmployeeForm from './AddEmployeeForm';

interface Company {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  full_name: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  position: string;
  company: string;
  company_id: number;
  manager_id: number | null;
  manager_name: string | null;
  phone: string | null;
  glpi_id: string | null;
  bitrix_id: string | null;
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
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
              <TableCell>ID</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Организация</TableCell>
              <TableCell>Руководитель</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>GLPI ID</TableCell>
              <TableCell>Битрикс ID</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.company}</TableCell>
                <TableCell>{employee.manager_name || '-'}</TableCell>
                <TableCell>{employee.phone || '-'}</TableCell>
                <TableCell>{employee.glpi_id || '-'}</TableCell>
                <TableCell>{employee.bitrix_id || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={handleOpenDialog}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(employee.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить сотрудника</DialogTitle>
        <DialogContent>
          <AddEmployeeForm
            onSuccess={() => {
              handleCloseDialog();
              fetchEmployees();
            }}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage; 