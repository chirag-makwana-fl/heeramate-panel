import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('heeramate_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('heeramate_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('heeramate_admin_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data?.admin) {
            setAdmin(res.data.data.admin);
            localStorage.setItem('heeramate_admin_user', JSON.stringify(res.data.data.admin));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, admin: adminData } = res.data.data;
    
    localStorage.setItem('heeramate_admin_token', receivedToken);
    localStorage.setItem('heeramate_admin_user', JSON.stringify(adminData));
    
    setToken(receivedToken);
    setAdmin(adminData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('heeramate_admin_token');
    localStorage.removeItem('heeramate_admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
