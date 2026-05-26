// src/app/auth/verify-otp/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Ambil user_id dari sessionStorage dan parse ke number
    const storedUserId = sessionStorage.getItem('otp_user_id');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      // Jika tidak ada, redirect ke register
      router.push('/auth/register');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Sesi tidak valid. Silakan daftar ulang.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/verify-otp', {
        user_id: userId, // sekarang number
        code: otp,
      });
      // Jika berhasil, login otomatis? API mengembalikan cookie dan user
      // Kita perlu menyimpan user ke context
      if (response.data.user) {
        // Set user ke context (misal dengan fungsi loginFromUser)
        // Atau kita panggil endpoint /me untuk mendapatkan user
        await login(undefined, undefined, true); // sesuaikan dengan implementasi login di AuthContext
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kadaluwarsa');
    } finally {
      setLoading(false);
    }
  };

  // Jika userId belum ada, tampilkan loading
  if (userId === null) {
    return <div className="text-center p-8">Memuat...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Verifikasi OTP</h1>
        <p className="text-center text-sm text-gray-600 mb-4">Kode OTP telah dikirim ke email Anda</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Kode OTP (6 digit)</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>
        </form>
      </div>
    </div>
  );
}