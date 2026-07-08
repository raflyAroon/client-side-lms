import { useState, useCallback, useEffect } from 'react';
import { auditLogService } from '@/services/auditLogService';
import { AuditLog } from '@/types/auditLog';

export const useAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditLogService.getAuditLogs(page);
      setLogs(res.data);
      setPagination({
        currentPage: res.current_page,
        lastPage: res.last_page,
        total: res.total,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat audit log');
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const rollback = useCallback(async (logId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await auditLogService.rollback(logId);
      // Refresh data after successful rollback
      await fetchLogs(pagination.currentPage);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal melakukan rollback';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchLogs, pagination.currentPage]);

  // Auto load on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    pagination,
    loading,
    error,
    fetchLogs,
    rollback,
  };
};