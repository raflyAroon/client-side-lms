import { useState, useCallback } from 'react';
import { pesertaService } from '@/services/pesertaService';
import { ConfirmBootcampPayload, ConfirmLolosPayload, TeamStatusResponse } from '@/types/team';

export const usePeserta = () => {
  const [status, setStatus] = useState<TeamStatusResponse | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pesertaService.getTeamStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmLolos = useCallback(async (payload: ConfirmLolosPayload) => {
    const res = await pesertaService.confirmLolosSeleksi(payload);
    await fetchStatus();
    return res;
  }, [fetchStatus]);

  const confirmBootcamp = useCallback(async (payload: ConfirmBootcampPayload) => {
    const res = await pesertaService.confirmBootcamp(payload);
    await fetchStatus();
    return res;
  }, [fetchStatus]);

  const fetchProfile = useCallback(async () => {
    const data = await pesertaService.getTeamProfile();
    setProfile(data);
  }, []);

  const fetchSubmissions = useCallback(async () => {
    const data = await pesertaService.getSubmissions();
    setSubmissions(data.submissions);
    return data;
  }, []);

  return {
    status,
    profile,
    submissions,
    loading,
    fetchStatus,
    confirmLolos,
    confirmBootcamp,
    fetchProfile,
    fetchSubmissions,
  };
};