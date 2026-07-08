// /app/dashboard/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role === 'admin') {
        router.push('/admin/');
      } else if (user.role === 'juri') {
        router.push('/juri/dashboard');
      } else {
        router.push('/peserta/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-white text-xl">Mengalihkan...</div>
    </div>
  );
}