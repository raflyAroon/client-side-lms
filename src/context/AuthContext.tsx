'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'juri' | 'peserta';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ userId: number }>;
  login: (email: string, password: string) => Promise<{ userId: number }>;
  verifyOtp: (userId: number, code: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/register', { name, email, password });
    return { userId: res.data.user_id };
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    return { userId: res.data.user_id };
  };

  const verifyOtp = async (userId: number, code: string) => {
    await api.post('/verify-otp', { user_id: userId, code });
    // Setelah verifikasi, user sudah login (cookie terpasang)
    await fetchMe();
  };

  const fetchMe = async () => {
  try {
    const response = await api.get('/me');
    setUser(response.data);
    return response.data;
  } catch {
    setUser(null);
    return null;
  }
};

useEffect(() => {
    fetchMe();
  }, []);

  const requestOtp = async (email: string) => {
    await api.post('/request-otp', { email });
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, verifyOtp, requestOtp, logout, fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};