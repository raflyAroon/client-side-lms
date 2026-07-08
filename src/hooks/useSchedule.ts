import { useState, useCallback, useEffect } from 'react';
import { scheduleService } from '@/services/scheduleService';
import { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from '@/types/schedule';

export const useSchedule = (scheduleId?: number) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (eventId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getSchedules(eventId);
      setSchedules(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    if (!scheduleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getSchedule(scheduleId);
      setSchedule(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  const create = useCallback(async (payload: CreateSchedulePayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.createSchedule(payload);
      await fetchSchedules(payload.event_id);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  const update = useCallback(async (id: number, payload: UpdateSchedulePayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.updateSchedule(id, payload);
      await fetchSchedules();
      if (scheduleId === id) setSchedule(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules, scheduleId]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await scheduleService.deleteSchedule(id);
      await fetchSchedules();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (scheduleId) fetchSchedule();
  }, [scheduleId, fetchSchedule]);

  return {
    schedules,
    schedule,
    loading,
    error,
    fetchSchedules,
    fetchSchedule,
    create,
    update,
    remove,
  };
};