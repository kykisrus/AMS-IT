import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Box, Modal, Alert, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from '../../utils/axios';
import AddUserForm from './AddUserForm';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: number;
  full_name: string;
  email: string;
  login: string;
  role: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      console.log('Token:', token);
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const response = await axios.get('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Response:', response.data);
      setUsers(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching users:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleAddUser = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleUserAdded = () => {
    setOpenModal(false);
    setEditingUser(null);
    fetchUsers();
  };

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: 'Администратор',
      office_manager: 'Руководитель в офисе',
      employee: 'Сотрудник'
    };
    return roles[role] || role;
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Пользователи</Typography>
        <Button variant="contained" onClick={handleAddUser}>
          Добавить пользователя
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.login}</td>
                <td>{user.email}</td>
                <td>{getRoleLabel(user.role)}</td>
                <td>
                  <IconButton onClick={() => handleEditUser(user)} size="small">
                    <EditIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="add-user-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1
        }}>
          <Typography variant="h6" gutterBottom>
            {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </Typography>
          <AddUserForm 
            onSuccess={handleUserAdded} 
            onCancel={handleModalClose}
            initialValues={editingUser}
          />
        </Box>
      </Modal>
    </Card>
  );
};

export default UsersPage; 