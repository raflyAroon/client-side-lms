import api from '@/lib/axios';
import { DashboardSummary } from '@/types/dashboard';

export const dashboardService = {
  /**
   * Get admin dashboard summary
   * Semua data real dari database
   */
  getAdminSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get('/admin/dashboard/summary');
    return res.data;
  },
};