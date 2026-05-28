'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { fetchCsrfCookie } from '@/lib/axios';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'juri' | 'peserta';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ userId: number; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ userId: number; message: string }>;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    await fetchCsrfCookie();
    const res = await api.post('/register', { name, email, password });
    return { userId: res.data.user_id, message: res.data.message };
  };

  const login = async (email: string, password: string) => {
    await fetchCsrfCookie();
    const res = await api.post('/login', { email, password });
    return { userId: res.data.user_id, message: res.data.message };
  };

  const requestOtp = async (email: string) => {
    await api.post('/request-otp', { email });
  };

  const verifyOtp = async (userId: number, code: string) => {
    await fetchCsrfCookie();
    await api.post('/verify-otp', { user_id: userId, code });
    const meRes = await api.get('/me');
    setUser(meRes.data);
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyOtp, requestOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};