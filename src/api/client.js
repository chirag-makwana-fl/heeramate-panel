import axios from 'axios';

// Resolve base API URL depending on environment and user config
const rawUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://api-heeramate.alovirainnovations.com/api/v1'
    : 'http://localhost:3000/api/v1');

// Normalize URL and ensure it points to the /admin route namespace
const cleanUrl = rawUrl.replace(/\/+$/, '');
const baseURL = cleanUrl.endsWith('/admin') ? cleanUrl : `${cleanUrl}/admin`;

const api = axios.create({
  baseURL,
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
