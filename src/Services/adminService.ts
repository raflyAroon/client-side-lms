// services/adminService.ts
import api from '@/lib/axios';

export const adminService = {
  listTeams: (status?: string, page = 1) =>
    api.get('/admin/teams', { params: { status, page } }),
  showTeam: (id: number) => api.get(`/admin/teams/${id}`),
  approveTeam: (id: number, note?: string) =>
    api.post(`/admin/teams/${id}/approve`, { note }),
  rejectTeam: (id: number, note: string) =>
    api.post(`/admin/teams/${id}/reject`, { note }),
  teamSubmissions: (teamId: number) =>
    api.get(`/admin/teams/${teamId}/submissions`),
  reviewSubmission: (submissionId: number, action: 'approved' | 'rejected', note?: string) =>
    api.post(`/admin/submissions/${submissionId}/review`, { action, note }),
  getTeamScores: async (stageId?: number) => {
    const params = stageId ?  {stage_id: stageId} : {};
    const res = await api.get('/admin/teams/scores', { params });
    return res.data;
  },
  getDashboardSummary: async () => {
    const res = await api.get('/admin/dashboard/summary');
      return res.data;
  }
};