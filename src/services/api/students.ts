import { supabase } from '../../lib/supabase';
import { Student } from '../../types/database';

export const studentsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(id, name, school_id)
      `)
      .order('name');

    if (error) throw error;
    return data as (Student & {
      class: { id: string; name: string; school_id: string };
    })[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(id, name, school_id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Student;
  },

  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  },

  async update(id: string, student: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};