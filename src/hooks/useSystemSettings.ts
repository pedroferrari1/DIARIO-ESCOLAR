import { useState, useCallback } from 'react';
import { systemSettingsApi } from '../services/api/systemSettings';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by: string;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemSettingsApi.getAll();
      setSettings(data);
    } catch (err) {
      setError('Erro ao carregar configurações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key: string, value: string) => {
    setLoading(true);
    setError(null);
    try {
      await systemSettingsApi.update(key, value);
      await fetchSettings(); // Recarrega as configurações após atualização
    } catch (err) {
      setError('Erro ao atualizar configuração');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting
  };
}