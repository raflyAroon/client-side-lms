import api from '@/lib/axios';
import { Stage, CreateStagePayload, UpdateStagePayload } from '@/types/stage';

export const stageService = {
  // Get all stages, optional filter by event_id
  getStages: async (eventId?: number): Promise<Stage[]> => {
    const params = eventId ? { event_id: eventId } : {};
    const res = await api.get('/admin/stages', { params });
    return res.data;
  },

  // Get single stage
  getStage: async (id: number): Promise<Stage> => {
    const res = await api.get(`/admin/stages/${id}`);
    return res.data;
  },

  // Create stage
  createStage: async (payload: CreateStagePayload): Promise<Stage> => {
    const res = await api.post('/admin/stages', payload);
    return res.data;
  },

  // Update stage
  updateStage: async (id: number, payload: UpdateStagePayload): Promise<Stage> => {
    const res = await api.put(`/admin/stages/${id}`, payload);
    return res.data;
  },

  // Delete stage
  deleteStage: async (id: number): Promise<void> => {
    await api.delete(`/admin/stages/${id}`);
  },
};