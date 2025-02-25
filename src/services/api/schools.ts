import { supabase } from '../../lib/supabase';
import { School } from '../../types/database';

export const schoolsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as School[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as School;
  },

  async create(school: Omit<School, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('schools')
      .insert(school)
      .select()
      .single();

    if (error) throw error;
    return data as School;
  },

  async update(id: string, school: Partial<School>) {
    const { data, error } = await supabase
      .from('schools')
      .update(school)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as School;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};