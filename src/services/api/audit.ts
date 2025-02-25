import { supabase } from '../../lib/supabase';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
}

export const auditApi = {
  async getLogs(params: {
    page?: number;
    limit?: number;
    entity_type?: string;
    action?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const {
      page = 1,
      limit = 50,
      entity_type,
      action,
      from_date,
      to_date
    } = params;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (from_date) {
      query = query.gte('created_at', from_date);
    }

    if (to_date) {
      query = query.lte('created_at', to_date);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      logs: data as AuditLog[],
      total: count || 0,
      page,
      limit
    };
  },

  async exportLogs(format: 'csv' | 'pdf') {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Implementar exportação baseada no formato
    if (format === 'csv') {
      // TODO: Implementar exportação CSV
    } else {
      // TODO: Implementar exportação PDF
    }

    return data;
  }
};