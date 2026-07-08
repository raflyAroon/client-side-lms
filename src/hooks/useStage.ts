import { useState, useCallback, useEffect } from 'react';
import { stageService } from '@/services/stageService';
import { Stage, CreateStagePayload, UpdateStagePayload } from '@/types/stage';

export const useStage = (stageId?: number) => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = useCallback(async (eventId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stageService.getStages(eventId);
      setStages(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStage = useCallback(async () => {
    if (!stageId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await stageService.getStage(stageId);
      setStage(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  const create = useCallback(async (payload: CreateStagePayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stageService.createStage(payload);
      await fetchStages(payload.event_id);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStages]);

  const update = useCallback(async (id: number, payload: UpdateStagePayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stageService.updateStage(id, payload);
      await fetchStages();
      if (stageId === id) setStage(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStages, stageId]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await stageService.deleteStage(id);
      await fetchStages();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStages]);

  useEffect(() => {
    fetchStages();
  }, []);

  useEffect(() => {
    if (stageId) fetchStage();
  }, [stageId, fetchStage]);

  return {
    stages,
    stage,
    loading,
    error,
    fetchStages,
    fetchStage,
    create,
    update,
    remove,
  };
};