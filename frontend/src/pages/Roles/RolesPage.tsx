import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Box, Modal, Alert, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import RoleForm from './RoleForm';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchRoles = async () => {
    try {
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const response = await axios.get('/api/roles');
      setRoles(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching roles:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Ошибка при загрузке ролей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRoles();
    }
  }, [token, fetchRoles]);

  const handleAddRole = () => {
    setEditingRole(null);
    setOpenModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setOpenModal(true);
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту роль?')) {
      try {
        await axios.delete(`/api/roles/${roleId}`);
        fetchRoles();
      } catch (error: any) {
        console.error('Error deleting role:', error);
        alert(error.response?.data?.error || 'Ошибка при удалении роли');
      }
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditingRole(null);
  };

  const handleRoleSaved = () => {
    setOpenModal(false);
    setEditingRole(null);
    fetchRoles();
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Роли</Typography>
        <Button variant="contained" onClick={handleAddRole}>
          Добавить роль
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
              <th>Название</th>
              <th>Описание</th>
              <th>Разрешения</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>{role.permissions.join(', ')}</td>
                <td>
                  <IconButton onClick={() => handleEditRole(role)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRole(role.id)} size="small" color="error">
                    <DeleteIcon />
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
        aria-labelledby="role-modal"
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
            {editingRole ? 'Редактировать роль' : 'Добавить роль'}
          </Typography>
          <RoleForm 
            onSuccess={handleRoleSaved} 
            onCancel={handleModalClose}
            initialValues={editingRole}
          />
        </Box>
      </Modal>
    </Card>
  );
};

export default RolesPage; 