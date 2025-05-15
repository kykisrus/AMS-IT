import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Grid,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from '../utils/axios';

interface Equipment {
  id: number;
  inventory_number: string;
  type: string;
  serial_number: string;
  uuid: string;
  model: string;
  manufacturer: string;
  purchase_date: string;
  purchase_cost: number;
  depreciation_period: number;
  liquidation_value: number;
  current_status: string;
  description?: string;
  company_id?: number;
  glpi_id?: string;
  current_owner?: number;
  owner_name?: string;
}

interface Company {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  full_name: string;
}

const statusOptions = [
  { value: 'in_stock', label: 'На складе' },
  { value: 'in_use', label: 'В использовании' },
  { value: 'written_off', label: 'Списано' },
  { value: 'in_repair', label: 'В ремонте' },
  { value: 'archived', label: 'Архив' }
];

const typeOptions = [
  'Компьютер', 'Монитор', 'Принтер', 'Сканер', 'Сетевое оборудование', 'Другое'
];

const emptyForm = {
  inventory_number: '',
  type: '',
  serial_number: '',
  uuid: '',
  model: '',
  manufacturer: '',
  purchase_date: '',
  purchase_cost: '',
  depreciation_period: '',
  liquidation_value: '',
  current_status: 'in_stock',
  current_owner: '',
  description: '',
  company_id: '',
  glpi_id: ''
};

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string>('');
  const equipmentFileInputRef = useRef<HTMLInputElement>(null);
  const employeeFileInputRef = useRef<HTMLInputElement>(null);
  // Фильтры
  const [filter, setFilter] = useState({
    inventory_number: '',
    model: '',
    status: '',
    manufacturer: ''
  });
  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('/api/equipment');
      setEquipment(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setEquipment([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      setCompanies([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchCompanies();
    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };

    // Автоматический расчет ликвидационной стоимости
    if (name === 'purchase_date' || name === 'purchase_cost') {
      const cost = parseFloat(name === 'purchase_cost' ? value : newForm.purchase_cost);
      const date = name === 'purchase_date' ? value : newForm.purchase_date;
      if (cost && date) {
        const years = getFullYears(date);
        let percent = 20;
        if (years === 0) percent = 90;
        else if (years === 1) percent = 70;
        else if (years === 2) percent = 60;
        else if (years === 3) percent = 40;
        else if (years === 4) percent = 30;
        // 5 и более лет — 20%
        newForm.liquidation_value = Math.round(cost * percent / 100).toString();
      } else {
        newForm.liquidation_value = '';
      }
    }

    setForm(newForm);
  };

  function getFullYears(purchaseDate: string): number {
    if (!purchaseDate) return 0;
    const now = new Date();
    const date = new Date(purchaseDate);
    let years = now.getFullYear() - date.getFullYear();
    if (
      now.getMonth() < date.getMonth() ||
      (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
    ) {
      years--;
    }
    return Math.max(0, years);
  }

  const handleAdd = async () => {
    try {
      setLoading(true);
      const payload = {
        ...form,
        current_owner: form.current_owner ? form.current_owner : null
      };
      await axios.post('/api/equipment', payload);
      setOpen(false);
      setForm({ ...emptyForm });
      fetchEquipment();
    } catch (error) {
      console.error('Error adding equipment:', error);
      alert('Ошибка добавления техники');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eq: Equipment) => {
    setEditId(eq.id);
    setForm({
      ...emptyForm,
      ...eq,
      purchase_cost: eq.purchase_cost?.toString() || '',
      depreciation_period: eq.depreciation_period?.toString() || '',
      liquidation_value: eq.liquidation_value?.toString() || '',
      current_owner: (eq as any).current_owner?.toString() || '',
      company_id: (eq as any).company_id?.toString() || '',
      glpi_id: (eq as any).glpi_id?.toString() || '',
      description: eq.description || ''
    });
    setOpen(true);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      setLoading(true);
      const payload = {
        ...form,
        current_owner: form.current_owner ? form.current_owner : null
      };
      await axios.put(`/api/equipment/${editId}`, payload);
      setOpen(false);
      setEditId(null);
      setForm({ ...emptyForm });
      fetchEquipment();
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert('Ошибка обновления техники');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await axios.delete(`/api/equipment/${deleteId}`);
      setDeleteId(null);
      fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Ошибка удаления техники');
    } finally {
      setLoading(false);
    }
  };

  const handleImportEmployees = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post('/api/employees/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchEmployees();
      setError('');
    } catch (error) {
      console.error('Error importing employees:', error);
      setError('Ошибка при импорте сотрудников');
    } finally {
      setLoading(false);
      if (employeeFileInputRef.current) {
        employeeFileInputRef.current.value = '';
      }
    }
  };

  const handleImportEquipment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post('/api/equipment/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchEquipment();
      setError('');
    } catch (error) {
      console.error('Error importing equipment:', error);
      setError('Ошибка при импорте оборудования');
    } finally {
      setLoading(false);
      if (equipmentFileInputRef.current) {
        equipmentFileInputRef.current.value = '';
      }
    }
  };

  // Фильтрация
  const filtered = equipment.filter(eq =>
    eq.inventory_number.toLowerCase().includes(filter.inventory_number.toLowerCase()) &&
    eq.model.toLowerCase().includes(filter.model.toLowerCase()) &&
    (filter.status ? eq.current_status === filter.status : true) &&
    eq.manufacturer.toLowerCase().includes(filter.manufacturer.toLowerCase())
  );

  // Экспорт в CSV
  const handleExportCSV = () => {
    const header = ['ID','Инвентарный номер','Серийный номер','UUID','Модель','Производитель','Дата покупки','Статус'];
    const rows = filtered.map(eq => [
      eq.id, eq.inventory_number, eq.serial_number, eq.uuid, eq.model, eq.manufacturer, eq.purchase_date, eq.current_status
    ]);
    const csv = [header, ...rows].map(r => r.map(String).map(s => '"'+s.replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusLabel = (status: string) => {
    const found = statusOptions.find(opt => opt.value === status);
    return found ? found.label : status;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Список техники</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            ref={employeeFileInputRef}
            onChange={handleImportEmployees}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => employeeFileInputRef.current?.click()}
          >
            Импорт сотрудников
          </Button>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            ref={equipmentFileInputRef}
            onChange={handleImportEquipment}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => equipmentFileInputRef.current?.click()}
          >
            Импорт техники
          </Button>
          <Button variant="outlined" onClick={handleExportCSV}>Выгрузить в CSV</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => { 
              setOpen(true); 
              setEditId(null); 
              setForm({ ...emptyForm }); 
            }}
          >
            Добавить
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} columns={12}>
          <Grid component="div" sx={{ gridColumn: 'span 3' }}>
            <TextField label="Инвентарный номер" size="small" fullWidth value={filter.inventory_number} onChange={e => setFilter(f => ({ ...f, inventory_number: e.target.value }))} />
          </Grid>
          <Grid component="div" sx={{ gridColumn: 'span 3' }}>
            <TextField label="Модель" size="small" fullWidth value={filter.model} onChange={e => setFilter(f => ({ ...f, model: e.target.value }))} />
          </Grid>
          <Grid component="div" sx={{ gridColumn: 'span 3' }}>
            <TextField label="Производитель" size="small" fullWidth value={filter.manufacturer} onChange={e => setFilter(f => ({ ...f, manufacturer: e.target.value }))} />
          </Grid>
          <Grid component="div" sx={{ gridColumn: 'span 3' }}>
            <TextField label="Статус" size="small" select fullWidth value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <MenuItem value="">Все</MenuItem>
              {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Инвентарный номер</TableCell>
              <TableCell>Серийный номер</TableCell>
              <TableCell>UUID</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Производитель</TableCell>
              <TableCell>Дата покупки</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(eq => (
              <TableRow key={eq.id}>
                <TableCell>{eq.id}</TableCell>
                <TableCell>{eq.inventory_number}</TableCell>
                <TableCell>{eq.serial_number}</TableCell>
                <TableCell>{eq.uuid}</TableCell>
                <TableCell>{eq.model}</TableCell>
                <TableCell>{eq.manufacturer}</TableCell>
                <TableCell>{eq.purchase_date}</TableCell>
                <TableCell>{getStatusLabel(eq.current_status)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать"><IconButton onClick={() => handleEdit(eq)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Удалить"><IconButton color="error" onClick={() => setDeleteId(eq.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Редактирование оборудования' : 'Добавление оборудования'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="inventory_number"
                label="Инвентарный номер"
                value={form.inventory_number}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="type"
                label="Тип"
                select
                value={form.type}
                onChange={handleChange}
                fullWidth
                required
              >
                {typeOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="serial_number"
                label="Серийный номер"
                fullWidth
                value={form.serial_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="model"
                label="Модель"
                fullWidth
                value={form.model}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="manufacturer"
                label="Производитель"
                fullWidth
                value={form.manufacturer}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="purchase_date"
                label="Дата покупки"
                type="date"
                fullWidth
                value={form.purchase_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="purchase_cost"
                label="Стоимость покупки"
                type="number"
                fullWidth
                value={form.purchase_cost}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="depreciation_period"
                label="Период амортизации (месяцев)"
                type="number"
                fullWidth
                value={form.depreciation_period}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="liquidation_value"
                label="Ликвидационная стоимость"
                type="number"
                fullWidth
                value={form.liquidation_value}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="current_status"
                label="Статус"
                select
                fullWidth
                value={form.current_status}
                onChange={handleChange}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="company_id"
                label="Организация"
                select
                fullWidth
                value={form.company_id}
                onChange={handleChange}
                required
              >
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="current_owner"
                label="Текущий владелец"
                select
                fullWidth
                value={form.current_owner}
                onChange={handleChange}
              >
                <MenuItem value="">Не выбран</MenuItem>
                {employees.map(employee => (
                  <MenuItem key={employee.id} value={employee.id}>{employee.full_name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Описание"
                multiline
                rows={4}
                fullWidth
                value={form.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button
            onClick={editId ? handleUpdate : handleAdd}
            variant="contained"
            disabled={loading}
          >
            {editId ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentList; 