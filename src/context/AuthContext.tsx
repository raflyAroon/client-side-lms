'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { fetchCsrfCookie } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'juri' | 'peserta';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<{ userId: number; message: string }>;
  verifyOtp: (userId: number, code: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Backup ke localStorage (cookie sudah dikelola backend)
const setLocalToken = (token: string) => localStorage.setItem('auth_token', token);
const removeLocalToken = () => localStorage.removeItem('auth_token');

// Baca token dari cookie atau localStorage (prioritas cookie)
const getAuthToken = (): string | null => {
  const tokenFromCookie = Cookies.get('auth_token');
  if (tokenFromCookie) return tokenFromCookie;
  return localStorage.getItem('auth_token');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = async (token: string) => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
      return true;
    } catch (err: any) {
      console.error('Token invalid:', err.response?.status);
      removeLocalToken();
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      await loadUser(token);
      setLoading(false);
    };
    initAuth();
  }, []);

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    await fetchCsrfCookie();
    const res = await api.post('/register', { name, email, password, password_confirmation });
    return { userId: res.data.user_id, message: res.data.message };
  };

  const login = async (email: string, password: string) => {
    await fetchCsrfCookie();
    await new Promise(resolve => setTimeout(resolve, 100));
    const res = await api.post('/login', { email, password });
    const { user, token } = res.data;
    setLocalToken(token); // backup
    setUser(user);
  };

  const requestOtp = async (email: string) => {
    await api.post('/request-otp', { email });
  };

  const verifyOtp = async (userId: number, code: string) => {
    await fetchCsrfCookie();
    const res = await api.post('/verify-otp', { user_id: userId, code });
    const { user, token } = res.data;
    setLocalToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      removeLocalToken();
      Cookies.remove('auth_token', { path: '/' });
      setUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyOtp, requestOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};