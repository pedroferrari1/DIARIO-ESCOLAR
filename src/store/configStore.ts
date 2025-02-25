import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { SystemConfig } from '../types/database';

interface ConfigState {
  configs: SystemConfig[];
  loading: boolean;
  error: string | null;
  fetchConfigs: () => Promise<void>;
  updateConfig: (key: string, value: string, description: string) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  configs: [],
  loading: false,
  error: null,

  fetchConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .order('key');

      if (error) throw error;
      set({ configs: data as SystemConfig[] });
    } catch (error) {
      set({ error: 'Erro ao carregar configurações' });
      console.error('Erro ao carregar configurações:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateConfig: async (key: string, value: string, description: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('system_configs')
        .upsert({
          key,
          value,
          description,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      get().fetchConfigs();
    } catch (error) {
      set({ error: 'Erro ao atualizar configuração' });
      console.error('Erro ao atualizar configuração:', error);
    } finally {
      set({ loading: false });
    }
  },
}));