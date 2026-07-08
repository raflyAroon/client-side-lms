import api from '@/lib/axios';
import { AuditLog } from '@/types/auditLog';

export const auditLogService = {
  // Get all audit logs (paginated)
  getAuditLogs: async (page = 1): Promise<{ data: AuditLog[]; current_page: number; last_page: number; total: number }> => {
    const res = await api.get('/admin/audit-logs', { params: { page } });
    return res.data;
  },

  // Get audit logs by entity
  getAuditLogsByEntity: async (entityType: string, entityId: number): Promise<AuditLog[]> => {
    const res = await api.get(`/admin/audit-logs/entity/${entityType}/${entityId}`);
    return res.data;
  },

  // Rollback to previous state
  rollback: async (logId: number): Promise<{ message: string; entity: any }> => {
    const res = await api.post(`/admin/audit-logs/${logId}/rollback`);
    return res.data;
  },
};