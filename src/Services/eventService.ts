import api from '@/lib/axios';
import { Event, CreateEventPayload, UpdateEventPayload } from '@/types/event';

export const eventService = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    const res = await api.get('/admin/events');
    return res.data;
  },

  // Get single event
  getEvent: async (id: number): Promise<Event> => {
    const res = await api.get(`/admin/events/${id}`);
    return res.data;
  },

  // Create event
  createEvent: async (payload: CreateEventPayload): Promise<Event> => {
    const res = await api.post('/admin/events', payload);
    return res.data;
  },

  // Update event
  updateEvent: async (id: number, payload: UpdateEventPayload): Promise<Event> => {
    const res = await api.put(`/admin/events/${id}`, payload);
    return res.data;
  },

  // Delete event
  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/admin/events/${id}`);
  },
};