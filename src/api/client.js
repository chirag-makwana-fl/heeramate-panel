import axios from 'axios';

// Live production API endpoint
const LIVE_API_URL = 'https://api-heeramate.alovirainnovations.com/api/v1';

// Local development API endpoint
const LOCAL_API_URL = 'http://localhost:3000/api/v1';

// Dynamic resolver: automatically chooses local API when working locally, and live API otherwise
const resolveBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;

    // Check if running on localhost / loopback
    const isLoopback =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0';

    if (isLoopback) {
      return import.meta.env.VITE_API_URL || LOCAL_API_URL;
    }

    // Check if running on local network (e.g. 192.168.x.x, 10.x.x.x) during development
    const isPrivateIp =
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

    if (isPrivateIp && import.meta.env.DEV) {
      return `http://${hostname}:3000/api/v1`;
    }

    // Any other host is a live/deployed production or staging environment
    return LIVE_API_URL;
  }

  // Fallback for SSR or build environment
  return import.meta.env.PROD ? LIVE_API_URL : (import.meta.env.VITE_API_URL || LOCAL_API_URL);
};

const rawUrl = resolveBaseUrl();

// Normalize URL and ensure it points to the /admin route namespace
const cleanUrl = rawUrl.replace(/\/+$/, '');
const baseURL = cleanUrl.endsWith('/admin') ? cleanUrl : `${cleanUrl}/admin`;

if (import.meta.env.DEV) {
  console.log(`[HeeraMate Admin API] Pointed to: ${baseURL}`);
}

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
