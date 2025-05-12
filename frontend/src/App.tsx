import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import Acts from './pages/Acts';
import CreateAct from './pages/CreateAct';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Защищенный маршрут
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  // Общий layout для защищенных маршрутов
  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f4f6fa' }}>
          {children}
            </Box>
          </Box>
        </Box>
  );

  return (
    <Router>
      <CssBaseline />
        <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <EquipmentList />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/acts"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Acts />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/acts/create"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CreateAct />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />} 
        />
        </Routes>
    </Router>
  );
};

export default App;
