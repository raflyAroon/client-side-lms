'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyOtpPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const { verifyOtp, requestOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('otp_user_id');
    const storedEmail = sessionStorage.getItem('otp_email');
    if (!storedUserId || !storedEmail) {
      router.push('/auth/login');
    } else {
      setUserId(parseInt(storedUserId));
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError('');
    setLoading(true);
    try {
      await verifyOtp(userId, code);
      sessionStorage.removeItem('otp_user_id');
      sessionStorage.removeItem('otp_email');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kadaluwarsa');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setError('');
    try {
      await requestOtp(email);
      alert('Kode OTP baru telah dikirim ke email Anda');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
    }
  };

  if (!userId || !email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Verifikasi OTP</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
          Masukkan kode 6 digit yang dikirim ke email <strong>{email}</strong>.
        </p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Kode OTP</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest"
              maxLength={6}
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
        <div className="text-center mt-4">
          <button
            onClick={handleResendOtp}
            className="text-sm text-blue-600 hover:underline"
          >
            Kirim ulang kode OTP
          </button>
        </div>
        <p className="text-center text-sm mt-4">
          <Link href="/auth/login" className="text-blue-600">Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}