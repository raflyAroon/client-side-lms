import api from '@/lib/axios';
import { TeamStatusResponse, ConfirmLolosPayload, ConfirmBootcampPayload } from '@/types/team';
import { Submission } from '@/types/submission';

export const pesertaService = {
  getTeamStatus: async (): Promise<TeamStatusResponse> => {
    const res = await api.get('/peserta/team/status');
    return res.data;
  },
  confirmLolosSeleksi: async (payload: ConfirmLolosPayload) => {
    const res = await api.post('/peserta/team/confirm-lolos-seleksi', payload);
    return res.data;
  },
  confirmBootcamp: async (payload: ConfirmBootcampPayload) => {
    const res = await api.post('/peserta/team/confirm-bootcamp', payload);
    return res.data;
  },
  getTeamProfile: async () => {
    const res = await api.get('/peserta/team/profile');
    return res.data;
  },
  getSubmissions: async () => {
    const res = await api.get('/peserta/submissions');
    return res.data;
  },
  uploadSubmissionFile: async (submissionId: number, data: FormData) => {
    const res = await api.post(`/peserta/submissions/${submissionId}/files`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  submitSubmission: async (submissionId: number) => {
    const res = await api.post(`/peserta/submissions/${submissionId}/submit`);
    return res.data;
  },
};