// services/teamService.ts
import api from '@/lib/axios';
import { Team, CreateTeamPayload, UpdateTeamPayload, TeamDocument } from '@/types/team';

export const teamService = {
  /**
   * Buat tim baru beserta anggota (tanpa dokumen - legacy)
   */
  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    const response = await api.post('/team', payload);
    return response.data.team;
  },

  /**
   * Ambil data tim milik user yang login
   */
  getMyTeam: async (): Promise<Team> => {
    const response = await api.get('/team');
    return response.data;
  },

  /**
   * Update tim (nama, institusi, anggota)
   */
  updateTeam: async (payload: UpdateTeamPayload): Promise<Team> => {
    const response = await api.put('/team', payload);
    return response.data.team;
  },

  /**
   * Riwayat perubahan tim
   */
  getTeamHistory: async (): Promise<any[]> => {
    const response = await api.get('/team/history');
    return response.data;
  },

  /**
   * Restore dari history
   */
  restoreTeam: async (historyId: number): Promise<any> => {
    const response = await api.post(`/team/restore/${historyId}`);
    return response.data;
  },

  /**
   * Pendaftaran tim lengkap (4 step) dengan upload dokumen
   * Mengirim FormData yang berisi:
   * - team_name, institution, city
   * - members array (name, email, phone, nim, faculty, study_program, position)
   * - file: hak_cipta, komitmen, rekomendasi, summary_brief, ktm_ketua, ktm_anggota1, ktm_anggota2
   * - video_link
   * - agree_privacy, agree_truth
   */
  completeRegistration: async (formData: FormData): Promise<{ message: string; team_id: number; selection_status: string }> => {
    const response = await api.post('/team/complete-registration', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Ambil dokumen tim (opsional)
   */
  getTeamDocuments: async (teamId: number): Promise<TeamDocument[]> => {
    const response = await api.get(`/team/${teamId}/documents`);
    return response.data;
  },
};