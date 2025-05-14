import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import Acts from './pages/Acts';
import CreateAct from './pages/CreateAct';
import EmployeesPage from './pages/Employees/EmployeesPage';
import EmployeeCard from './pages/Employees/EmployeeCard';
import UsersPage from './pages/Users/UsersPage';
import SettingsPage from './pages/Settings/SettingsPage';
import IntegrationPage from './pages/System/IntegrationPage';
import RolesPage from './pages/Roles/RolesPage';
import OrganizationsPage from './pages/OrganizationsPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#0a1929',
      paper: '#1a2332',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="equipment" element={<EquipmentList />} />
              <Route path="acts" element={<Acts />} />
              <Route path="acts/create" element={<CreateAct />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="employees/:id" element={<EmployeeCard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="system/integration" element={<IntegrationPage />} />
              <Route path="organizations" element={<OrganizationsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
