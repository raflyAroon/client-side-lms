import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Prioritas: cookie > localStorage
const getAuthToken = (): string | null => {
  const tokenFromCookie = Cookies.get('auth_token');
  console.log('Token from cookie:', tokenFromCookie?.substring(0, 20));
  return localStorage.getItem('auth_token');
  
};

api.interceptors.request.use((config) => {
  const xsrfToken = Cookies.get('XSRF-TOKEN');
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken;
  }
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url} - Auth: ${!!token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      Cookies.remove('auth_token', { path: '/' });
      localStorage.removeItem('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const fetchCsrfCookie = async () => {
  await api.get('/sanctum/csrf-cookie');
};

export default api;