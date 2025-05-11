import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip
} from '@mui/material';
import Grid from '@mui/system/Grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Equipment {
  id: number;
  inventory_number: string;
  serial_number: string;
  uuid: string;
  model: string;
  manufacturer: string;
  purchase_date: string;
  purchase_cost: number;
  depreciation_period: number;
  liquidation_value: number;
  current_status: string;
}

const statusOptions = [
  'in_stock', 'in_use', 'written_off', 'in_repair', 'archived'
];

const emptyForm = {
  inventory_number: '', serial_number: '', uuid: '', model: '', manufacturer: '',
  purchase_date: '', purchase_cost: '', depreciation_period: '', liquidation_value: '',
  current_status: 'in_stock', current_owner_id: '', company_id: '', glpi_id: ''
};

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  // Фильтры
  const [filter, setFilter] = useState({
    inventory_number: '',
    model: '',
    status: '',
    manufacturer: ''
  });

  const fetchEquipment = () => {
    fetch('/api/equipment', {
      headers: { Authorization: `Bearer ${localStorage.getItem('ams_token')}` }
    })
      .then(res => res.json())
      .then(data => setEquipment(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error('Error fetching equipment:', error);
        setEquipment([]);
      });
  };

  useEffect(() => { fetchEquipment(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    setLoading(true);
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ams_token')}`
      },
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({ ...emptyForm });
      fetchEquipment();
    } else {
      alert('Ошибка добавления техники');
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
      current_owner_id: (eq as any).current_owner_id?.toString() || '',
      company_id: (eq as any).company_id?.toString() || '',
      glpi_id: (eq as any).glpi_id?.toString() || ''
    });
    setOpen(true);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setLoading(true);
    const res = await fetch(`/api/equipment/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ams_token')}`
      },
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setEditId(null);
      setForm({ ...emptyForm });
      fetchEquipment();
    } else {
      alert('Ошибка обновления техники');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const res = await fetch(`/api/equipment/${deleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('ams_token')}` }
    });
    setLoading(false);
    setDeleteId(null);
    if (res.ok) {
      fetchEquipment();
    } else {
      alert('Ошибка удаления техники');
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Список техники</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleExportCSV}>Выгрузить в CSV</Button>
          <Button variant="contained" color="primary" onClick={() => { setOpen(true); setEditId(null); setForm({ ...emptyForm }); }}>Добавить</Button>
        </Box>
      </Box>
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
              {statusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
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
                <TableCell>{eq.current_status}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать"><IconButton onClick={() => handleEdit(eq)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Удалить"><IconButton color="error" onClick={() => setDeleteId(eq.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Редактировать технику' : 'Добавить технику'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Инвентарный номер" name="inventory_number" value={form.inventory_number} onChange={handleChange} required fullWidth />
          <TextField label="Серийный номер" name="serial_number" value={form.serial_number} onChange={handleChange} fullWidth />
          <TextField label="UUID" name="uuid" value={form.uuid} onChange={handleChange} fullWidth />
          <TextField label="Модель" name="model" value={form.model} onChange={handleChange} required fullWidth />
          <TextField label="Производитель" name="manufacturer" value={form.manufacturer} onChange={handleChange} required fullWidth />
          <TextField label="Дата покупки" name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="Стоимость" name="purchase_cost" value={form.purchase_cost} onChange={handleChange} type="number" fullWidth />
          <TextField label="Срок амортизации (мес)" name="depreciation_period" value={form.depreciation_period} onChange={handleChange} type="number" fullWidth />
          <TextField label="Ликвидационная стоимость" name="liquidation_value" value={form.liquidation_value} onChange={handleChange} type="number" fullWidth />
          <TextField label="Статус" name="current_status" value={form.current_status} onChange={handleChange} select fullWidth>
            {statusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          {editId ? (
            <Button onClick={handleUpdate} variant="contained" disabled={loading}>Сохранить</Button>
          ) : (
            <Button onClick={handleAdd} variant="contained" disabled={loading}>Сохранить</Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Удалить технику?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentList; 