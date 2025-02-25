import { supabase } from '../../lib/supabase';
import { Teacher } from '../../types/database';

interface CreateTeacherData {
  full_name: string;
  email: string;
  password: string;
  school_id: string;
  role: 'teacher';
  active: boolean;
}

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

  async create(teacherData: CreateTeacherData) {
    // Primeiro, criar o usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: teacherData.email,
      password: teacherData.password,
      options: {
        data: {
          full_name: teacherData.full_name,
          role: teacherData.role,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Erro ao criar usuário');

    try {
      // Criar o registro na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: teacherData.full_name,
          email: teacherData.email,
          role: teacherData.role,
          active: teacherData.active,
        });

      if (userError) throw userError;

      // Criar o registro na tabela teachers
      const { data: teacherRecord, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: authData.user.id,
          school_id: teacherData.school_id,
        })
        .select(`
          *,
          user:users(id, full_name, email),
          school:schools(id, name)
        `)
        .single();

      if (teacherError) throw teacherError;
      return teacherRecord as Teacher;

    } catch (error) {
      // Se algo der errado, tentar limpar os dados criados
      if (authData.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};