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
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ImportJob, ImportStatus } from '../../types/import';
import { importService } from '../../services/importService';

const statusLabels: Record<ImportStatus, string> = {
  [ImportStatus.PENDING]: 'Ожидает',
  [ImportStatus.IN_PROGRESS]: 'Выполняется',
  [ImportStatus.COMPLETED]: 'Завершен',
  [ImportStatus.FAILED]: 'Ошибка',
  [ImportStatus.CANCELLED]: 'Отменен'
};

const statusColors: Record<ImportStatus, 'default' | 'primary' | 'success' | 'error'> = {
  [ImportStatus.PENDING]: 'default',
  [ImportStatus.IN_PROGRESS]: 'primary',
  [ImportStatus.COMPLETED]: 'success',
  [ImportStatus.FAILED]: 'error',
  [ImportStatus.CANCELLED]: 'default'
};

interface ImportHistoryProps {
  onViewDetails?: (job: ImportJob) => void;
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ onViewDetails }) => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await importService.getHistory(page + 1, rowsPerPage);
      setJobs(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Ошибка при загрузке истории импортов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadReport = async (jobId: string) => {
    try {
      const blob = await importService.getReport(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-report-${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Ошибка при скачивании отчета');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        История импортов
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Обработано</TableCell>
              <TableCell>Ошибки</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{formatDate(job.startTime)}</TableCell>
                <TableCell>
                  {job.type === 'employees' && 'Сотрудники'}
                  {job.type === 'equipment' && 'Оборудование'}
                  {job.type === 'companies' && 'Компании'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[job.status]}
                    color={statusColors[job.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {job.processedRows} из {job.totalRows}
                </TableCell>
                <TableCell>{job.errorRows?.length || 0}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Просмотреть детали">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails && onViewDetails(job)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {job.status !== ImportStatus.PENDING && (
                    <Tooltip title="Скачать отчет">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReport(job.id)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Нет данных
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
        }
      />
    </Paper>
  );
};

export default ImportHistory; 