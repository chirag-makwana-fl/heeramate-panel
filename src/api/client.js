import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('heeramate_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('heeramate_admin_token');
      localStorage.removeItem('heeramate_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
