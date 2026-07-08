import { useState, useCallback, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import { Event, CreateEventPayload, UpdateEventPayload } from '@/types/event';

export const useEvent = (eventId?: number) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const create = useCallback(async (payload: CreateEventPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.createEvent(payload);
      await fetchEvents(); // refresh list
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const update = useCallback(async (id: number, payload: UpdateEventPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.updateEvent(id, payload);
      await fetchEvents();
      if (eventId === id) setEvent(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, eventId]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await eventService.deleteEvent(id);
      await fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId, fetchEvent]);

  return {
    events,
    event,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    create,
    update,
    remove,
  };
};