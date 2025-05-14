import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../utils/axios';

interface Company {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  mol_id?: number;
  mol_name?: string;
}

interface MolUser {
  id: number;
  full_name: string;
}

const OrganizationsPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [molId, setMolId] = useState<number | ''>('');
  const [mols, setMols] = useState<MolUser[]>([]);
  const [dialogError, setDialogError] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchMols();
  }, []);

  const fetchMols = async () => {
    try {
      const response = await axios.get('/api/users/mols');
      setMols(response.data);
    } catch (err) {
      setMols([]);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке списка организаций');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    setSelectedCompany(company || null);
    setCompanyName(company?.name || '');
    setPhone(company?.phone || '');
    setEmail(company?.email || '');
    setWebsite(company?.website || '');
    setLogoUrl(company?.logo_url || '');
    setMolId(company?.mol_id || '');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
    setCompanyName('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setLogoUrl('');
    setMolId('');
    setDialogError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setDialogError('Название организации обязательно');
      return;
    }
    if (!molId) {
      setDialogError('Выберите МОЛ');
      return;
    }
    try {
      const payload = {
        name: companyName,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        logo_url: logoUrl || undefined,
        mol_id: molId
      };
      if (selectedCompany) {
        await axios.put(`/api/companies/${selectedCompany.id}`, payload);
      } else {
        await axios.post('/api/companies', payload);
      }
      handleCloseDialog();
      fetchCompanies();
    } catch (err) {
      setDialogError('Ошибка при сохранении организации');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить организацию?')) return;
    try {
      await axios.delete(`/api/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      setError('Ошибка при удалении организации');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Организации</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Добавить организацию
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.id}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(company)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(company.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCompany ? 'Редактировать организацию' : 'Добавить организацию'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Название организации"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              margin="normal"
              required
              error={!!dialogError}
              helperText={dialogError}
            />
            <TextField
              fullWidth
              label="Телефон"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Веб-сайт"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Логотип (URL)"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              margin="normal"
              placeholder="https://example.com/logo.png"
            />
            <TextField
              select
              fullWidth
              label="МОЛ (материально-ответственное лицо)"
              value={molId}
              onChange={e => setMolId(Number(e.target.value))}
              margin="normal"
              required
            >
              <MenuItem value="">Выберите МОЛ</MenuItem>
              {mols.map((mol) => (
                <MenuItem key={mol.id} value={mol.id}>{mol.full_name}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained">{selectedCompany ? 'Сохранить' : 'Добавить'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default OrganizationsPage; 