import { supabase } from '../../lib/supabase';
import type { SystemSetting } from '../../hooks/useSystemSettings';

export const systemSettingsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key');

    if (error) throw error;
    return data as SystemSetting[];
  },

  async update(key: string, value: string) {
    const { error } = await supabase
      .from('system_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) throw error;
  }
};