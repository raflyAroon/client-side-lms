// hooks/useTeam.ts
import { useState, useEffect, useCallback } from 'react';
import { teamService} from '@/services/teamService';
import { Team, CreateTeamPayload, UpdateTeamPayload } from '@/types/team';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const useTeam = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getMyTeam();
      setTeam(data);
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 422) {
        // Tim belum ada
        setTeam(null);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTeam = async (payload: CreateTeamPayload) => {
    setLoading(true);
    setError(null);
    try {
      const newTeam = await teamService.createTeam(payload);
      setTeam(newTeam);
      return newTeam;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (payload: UpdateTeamPayload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await teamService.updateTeam(payload);
      setTeam(updated);
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi batal pendaftaran: logout dan redirect ke login
  const cancelRegistration = async () => {
    await logout();
    router.push('/auth/login');
  };

  useEffect(() => {
    if (user) {
      fetchTeam();
    } else {
      setTeam(null);
      setLoading(false);
    }
  }, [user, fetchTeam]);

  return {
    team,
    loading,
    error,
    fetchTeam,
    createTeam,
    updateTeam,
    cancelRegistration,
    hasTeam: !!team,
  };
};