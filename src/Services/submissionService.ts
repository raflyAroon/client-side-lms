// services/submissionService.ts
import api from '@/lib/axios';
import { Submission, CreateSubmissionPayload, UpdateSubmissionPayload, SubmissionFile } from '@/types/submission';

export const submissionService = {
  // Buat submission draft
  createSubmission: async (payload: CreateSubmissionPayload): Promise<Submission> => {
    const response = await api.post('/submissions', payload);
    return response.data;
  },

  // Ambil detail submission (dengan file)
  getSubmission: async (submissionId: number): Promise<Submission> => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  },

  // Update submission (deskripsi, project_type)
  updateSubmission: async (submissionId: number, payload: UpdateSubmissionPayload): Promise<Submission> => {
    const response = await api.put(`/submissions/${submissionId}`, payload);
    return response.data;
  },

  // Upload file (multipart)
  uploadFiles: async (submissionId: number, files: File[]): Promise<SubmissionFile[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));
    const response = await api.post(`/submissions/${submissionId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Tambah link eksternal
  addLink: async (submissionId: number, url: string, description?: string): Promise<SubmissionFile> => {
    const response = await api.post(`/submissions/${submissionId}/links`, { url, description });
    return response.data;
  },

  // Hapus file/link
  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/submission-files/${fileId}`);
  },

  // Submit final (ubah status menjadi submitted)
  submitSubmission: async (submissionId: number): Promise<void> => {
    await api.post(`/submissions/${submissionId}/submit`);
  },
};