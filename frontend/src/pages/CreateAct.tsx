import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Chip,
  LinearProgress,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

interface Equipment {
  id: number;
  name: string;
  inventory_number: string;
  cost: number;
}

const CreateAct: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [type, setType] = useState<'transfer' | 'repair' | 'write_off'>('transfer');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchEquipment = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/equipment');

        if (!isMounted) return;

        const data = response.data;
        if (isMounted) {
          setEquipment(data.equipment);
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

    fetchEquipment();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEquipment.length === 0) {
      setError('Выберите хотя бы одну единицу техники');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await axios.post('/api/acts', {
        type,
        equipment_ids: selectedEquipment.map(e => e.id)
      });

      const data = response.data;
      navigate(`/acts/${data.act_id}`);
    } catch (error) {
      console.error('Ошибка при создании акта:', error);
      setError('Не удалось создать акт. Пожалуйста, попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Создание акта
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/acts')}
        >
          Назад к списку
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип акта</InputLabel>
                <Select
                  value={type}
                  label="Тип акта"
                  onChange={(e) => setType(e.target.value as 'transfer' | 'repair' | 'write_off')}
                >
                  <MenuItem value="transfer">Приём-передача</MenuItem>
                  <MenuItem value="repair">Ремонт</MenuItem>
                  <MenuItem value="write_off">Списание</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={equipment}
                getOptionLabel={(option) => `${option.name} (${option.inventory_number})`}
                value={selectedEquipment}
                onChange={(_, newValue) => setSelectedEquipment(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Техника"
                    placeholder="Выберите технику"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.name} (${option.inventory_number})`}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/acts')}
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                >
                  Создать акт
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateAct; 