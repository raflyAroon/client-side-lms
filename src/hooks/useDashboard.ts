import { useState, useCallback, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardSummary } from '@/types/dashboard';

export const useDashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getAdminSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data dashboard');
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    fetchSummary,
  };
};