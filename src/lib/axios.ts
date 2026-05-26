import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // penting untuk cookie
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor untuk menangani error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau tidak valid
      if (typeof window !== 'undefined') {
        // Redirect ke login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;