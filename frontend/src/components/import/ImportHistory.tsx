import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ImportJob, ImportType, ImportStatus, IMPORT_TYPES, IMPORT_STATUSES } from '../../types/import';
import { importService } from '../../api/services/importService';

const statusColors: Record<ImportStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'default',
  in_progress: 'primary',
  completed: 'success',
  failed: 'error',
  cancelled: 'warning',
  completed_with_errors: 'warning'
};

const ImportHistory: React.FC = () => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
    setLoading(true);
      const data = await importService.getImportJobs();
      setJobs(data);
      setTotal(data.length);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить историю импорта');
      console.error('Error loading import jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadReport = async (jobId: string) => {
    try {
      const blob = await importService.downloadReport(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-report-${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await importService.deleteImportJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  if (loading) {
  return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadJobs}
          variant="outlined"
        >
          Повторить
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          История импорта
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadJobs}
          variant="outlined"
        >
          Обновить
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Файл</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{IMPORT_TYPES[job.type]}</TableCell>
                <TableCell>
                  <Chip
                    label={IMPORT_STATUSES[job.status]}
                    color={statusColors[job.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(job.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {job.status !== 'pending' && (
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadReport(job.id)}
                      title="Скачать отчет"
                    >
                      <DownloadIcon />
                    </IconButton>
                  )}
                      <IconButton
                        size="small"
                    onClick={() => handleDeleteJob(job.id)}
                    title="Удалить"
                      >
                    <DeleteIcon />
                      </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ImportHistory; 