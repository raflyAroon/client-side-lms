'use client';

import { useAuth } from '@/context/AuthContext';

export const useAuthHook = () => {
  return useAuth();
};