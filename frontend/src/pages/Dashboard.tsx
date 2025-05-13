import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface DashboardMetrics {
  equipmentInUse: number;
  equipmentInRepair: number;
  equipmentWrittenOff: number;
  unsignedActs: number;
  repairCosts: {
    labels: string[];
    data: number[];
  };
}

interface RecentEvent {
  id: number;
  date: string;
  employee: string;
  type: 'transfer' | 'writeoff';
  status: 'pending' | 'completed';
  equipment: string;
}

interface RepairStatus {
  id: number;
  equipment: string;
  date: string;
  status: 'in_repair' | 'waiting_conclusion';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [currentRepairs, setCurrentRepairs] = useState<RepairStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/dashboard/metrics');

        if (!isMounted) return;

        const data = response.data;
        if (isMounted) {
          setMetrics(data.metrics);
          setRecentEvents(data.recentEvents || []);
          setCurrentRepairs(data.currentRepairs || []);
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

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

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

  if (!metrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Нет данных для отображения</Alert>
      </Box>
    );
  }

  const repairCostsData = {
    labels: metrics.repairCosts?.labels || [],
    datasets: [
      {
        label: 'Затраты на ремонт',
        data: metrics.repairCosts?.data || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Основные метрики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Техника в эксплуатации
              </Typography>
              <Typography variant="h4">{metrics.equipmentInUse}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                На ремонте
              </Typography>
              <Typography variant="h4">{metrics.equipmentInRepair}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Списанная техника
              </Typography>
              <Typography variant="h4">{metrics.equipmentWrittenOff}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Неподписанные акты
              </Typography>
              <Typography variant="h4">{metrics.unsignedActs}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Быстрые действия */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/acts/create')}
            >
              Создать акт
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/equipment/add')}
            >
              Добавить технику
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={() => navigate('/repairs/create')}
            >
              Создать ремонт
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* График затрат на ремонты */}
      {metrics.repairCosts?.data.length > 0 && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Затраты на ремонты
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar
              data={repairCostsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Последние события */}
      {recentEvents.length > 0 && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Последние события
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Сотрудник</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Техника</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.employee}</TableCell>
                  <TableCell>{event.type === 'transfer' ? 'Передача' : 'Списание'}</TableCell>
                  <TableCell>{event.status === 'pending' ? 'Ожидает' : 'Завершено'}</TableCell>
                  <TableCell>{event.equipment}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/acts/${event.id}`)}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Текущие ремонты */}
      {currentRepairs.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Текущие ремонты
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Техника</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>{repair.equipment}</TableCell>
                  <TableCell>{repair.date}</TableCell>
                  <TableCell>
                    {repair.status === 'in_repair' ? 'В ремонте' : 'Ожидает заключения'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/repairs/${repair.id}`)}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard; 