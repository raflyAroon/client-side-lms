// services/teamService.ts
import api from '@/lib/axios';
import { Team, CreateTeamPayload, UpdateTeamPayload } from '@/types/team';

export const teamService = {
  // Buat tim baru beserta anggota
  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    const response = await api.post('/team', payload);
    return response.data.team;
  },

  // Ambil data tim milik user yang login
  getMyTeam: async (): Promise<Team> => {
    const response = await api.get('/team');
    return response.data;
  },

  // Update tim (nama, institusi, anggota)
  updateTeam: async (payload: UpdateTeamPayload): Promise<Team> => {
    const response = await api.put('/team', payload);
    return response.data.team;
  },

  // Riwayat perubahan tim
  getTeamHistory: async (): Promise<any[]> => {
    const response = await api.get('/team/history');
    return response.data;
  },

  // Restore dari history
  restoreTeam: async (historyId: number): Promise<any> => {
    const response = await api.post(`/team/restore/${historyId}`);
    return response.data;
  },
};