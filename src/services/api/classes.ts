import { supabase } from '../../lib/supabase';
import { cacheManager } from '../../lib/cache';
import { Class } from '../../types/database';

const CACHE_KEYS = {
  ALL_CLASSES: 'classes:all',
  CLASS_DETAILS: (id: string) => `classes:${id}`,
  CLASS_STUDENTS: (id: string) => `classes:${id}:students`,
  CLASS_TEACHERS: (id: string) => `classes:${id}:teachers`,
};

export const classesApi = {
  async getAll() {
    return cacheManager.getOrFetch(CACHE_KEYS.ALL_CLASSES, async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          school:schools(id, name),
          teachers:class_teachers(
            teacher:teachers(
              id,
              user:users(id, full_name, email)
            )
          )
        `)
        .order('name');

      if (error) throw error;
      return data as Class[];
    });
  },

  async getById(id: string) {
    return cacheManager.getOrFetch(CACHE_KEYS.CLASS_DETAILS(id), async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          school:schools(id, name),
          teachers:class_teachers(
            teacher:teachers(
              id,
              user:users(id, full_name, email)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Class;
    });
  },

  async create(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('classes')
      .insert(classData)
      .select()
      .single();

    if (error) throw error;
    cacheManager.invalidate(CACHE_KEYS.ALL_CLASSES);
    return data as Class;
  },

  async update(id: string, classData: Partial<Class>) {
    const { data, error } = await supabase
      .from('classes')
      .update(classData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    cacheManager.invalidate(CACHE_KEYS.ALL_CLASSES);
    cacheManager.invalidate(CACHE_KEYS.CLASS_DETAILS(id));
    return data as Class;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    cacheManager.invalidate(CACHE_KEYS.ALL_CLASSES);
    cacheManager.invalidate(CACHE_KEYS.CLASS_DETAILS(id));
  },

  async addTeacher(classId: string, teacherId: string) {
    const { error } = await supabase
      .from('class_teachers')
      .insert({ class_id: classId, teacher_id: teacherId });

    if (error) throw error;
    cacheManager.invalidate(CACHE_KEYS.CLASS_TEACHERS(classId));
  },

  async removeTeacher(classId: string, teacherId: string) {
    const { error } = await supabase
      .from('class_teachers')
      .delete()
      .eq('class_id', classId)
      .eq('teacher_id', teacherId);

    if (error) throw error;
    cacheManager.invalidate(CACHE_KEYS.CLASS_TEACHERS(classId));
  },

  async getStudents(classId: string) {
    return cacheManager.getOrFetch(CACHE_KEYS.CLASS_STUDENTS(classId), async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name');

      if (error) throw error;
      return data;
    });
  }
};