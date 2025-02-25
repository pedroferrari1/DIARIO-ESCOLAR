import { useState, useCallback } from 'react';
import { adminApi, SystemStats, UserActivity } from '../services/api/admin';

export function useAdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [systemStats, userActivities] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getUserActivities(10)
      ]);
      setStats(systemStats);
      setActivities(userActivities);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    activities,
    loading,
    error,
    fetchDashboardData
  };
}