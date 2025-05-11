import { useState } from 'react';

const TOKEN_KEY = 'ams_token';
const USER_KEY = 'ams_user';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) return false;
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
    setUser(null);
  };

  const getUser = () => user;

  return { isAuthenticated, login, logout, getUser };
} 