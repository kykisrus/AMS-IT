import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

interface RegisterData {
  login: string;
  password: string;
  email: string;
  full_name: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Здесь можно добавить запрос для получения данных пользователя
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      console.log('Received token and user data:', { newToken, userData });
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log('Login successful, auth header set');
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('Attempting registration with:', { userData });
      const response = await axios.post('/api/auth/register', userData);
      console.log('Registration response:', response.data);
      
      const { token: newToken, user: userData2 } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData2);
      setIsAuthenticated(true);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log('Registration successful, auth header set');
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 