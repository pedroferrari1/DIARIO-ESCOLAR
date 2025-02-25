import { supabase } from '../../lib/supabase';

export interface SystemStats {
  total_schools: number;
  total_teachers: number;
  total_students: number;
  total_classes: number;
  active_users: number;
  system_attendance_rate: number;
}

export interface SchoolStats {
  total_teachers: number;
  total_students: number;
  total_classes: number;
  attendance_rate: number;
}

export interface UserActivity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  user_name: string;
  user_role: string;
}

export const adminApi = {
  async getSystemStats(): Promise<SystemStats> {
    const { data, error } = await supabase
      .rpc('fn_get_system_stats')
      .single();

    if (error) throw error;
    return data;
  },

  async getSchoolStats(schoolId: string): Promise<SchoolStats> {
    const { data, error } = await supabase
      .rpc('fn_get_school_stats', { school_id: schoolId })
      .single();

    if (error) throw error;
    return data;
  },

  async getUserActivities(limit = 50): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('admin_user_activities')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getDashboardStats() {
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
};