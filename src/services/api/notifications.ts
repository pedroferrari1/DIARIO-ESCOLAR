import { supabase } from '../../lib/supabase';
import { Notification } from '../../types/database';

export const notificationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};