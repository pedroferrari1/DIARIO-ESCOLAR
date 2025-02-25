import { supabase } from '../../lib/supabase';
import { Teacher } from '../../types/database';

export const teachersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        user:users(id, full_name, email),
        school:schools(id, name)
      `)
      .order('created_at');

    if (error) throw error;
    return data as (Teacher & {
      user: { id: string; full_name: string; email: string };
      school: { id: string; name: string };
    })[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        user:users(id, full_name, email),
        school:schools(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Teacher;
  },

  async create(teacher: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('teachers')
      .insert(teacher)
      .select()
      .single();

    if (error) throw error;
    return data as Teacher;
  },

  async update(id: string, teacher: Partial<Teacher>) {
    const { data, error } = await supabase
      .from('teachers')
      .update(teacher)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Teacher;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};