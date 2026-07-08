import api from '@/lib/axios';
import { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from '@/types/schedule';

export const scheduleService = {
  // Get all schedules, optional filter by event_id
  getSchedules: async (eventId?: number): Promise<Schedule[]> => {
    const params = eventId ? { event_id: eventId } : {};
    const res = await api.get('/admin/schedules', { params });
    return res.data;
  },

  // Get single schedule
  getSchedule: async (id: number): Promise<Schedule> => {
    const res = await api.get(`/admin/schedules/${id}`);
    return res.data;
  },

  // Create schedule
  createSchedule: async (payload: CreateSchedulePayload): Promise<Schedule> => {
    const res = await api.post('/admin/schedules', payload);
    return res.data;
  },

  // Update schedule
  updateSchedule: async (id: number, payload: UpdateSchedulePayload): Promise<Schedule> => {
    const res = await api.put(`/admin/schedules/${id}`, payload);
    return res.data;
  },

  // Delete schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/admin/schedules/${id}`);
  },
};