import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

interface Act {
  id: number;
  number: string;
  date: string;
  type: 'transfer' | 'repair' | 'write_off';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by: string;
  equipment_count: number;
  total_cost?: number;
}

const Acts: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [acts, setActs] = useState<Act[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchActs = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/acts');

        if (!isMounted) return;
        const data = response.data;
        if (isMounted) {
          setActs(data.acts);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Ошибка при загрузке данных:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActs();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, navigate]);

  const getStatusColor = (status: Act['status']) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Act['status']) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'pending':
        return 'На рассмотрении';
      case 'approved':
        return 'Утвержден';
      case 'rejected':
        return 'Отклонен';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: Act['type']) => {
    switch (type) {
      case 'transfer':
        return 'Приём-передача';
      case 'repair':
        return 'Ремонт';
      case 'write_off':
        return 'Списание';
      default:
        return type;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Акты
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/acts/create')}
        >
          Создать акт
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Создал</TableCell>
              <TableCell>Количество техники</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {acts.map((act) => (
              <TableRow key={act.id}>
                <TableCell>{act.number}</TableCell>
                <TableCell>{new Date(act.date).toLocaleDateString()}</TableCell>
                <TableCell>{getTypeLabel(act.type)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(act.status)}
                    color={getStatusColor(act.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{act.created_by}</TableCell>
                <TableCell>{act.equipment_count}</TableCell>
                <TableCell>{act.total_cost ? `${act.total_cost} ₽` : '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/acts/${act.id}`)}
                    title="Просмотр"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {act.status === 'draft' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/acts/${act.id}/edit`)}
                        title="Редактировать"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Удалить"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Acts; 