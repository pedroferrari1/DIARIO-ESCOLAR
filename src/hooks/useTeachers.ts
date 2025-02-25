import { useState, useCallback } from 'react';
import { Teacher } from '../types/database';
import { teachersApi } from '../services/api/teachers';
import { PostgrestError } from '@supabase/supabase-js';

interface CreateTeacherData {
  full_name: string;
  email: string;
  password: string;
  school_id: string;
  role: 'teacher';
  active: boolean;
}

export interface TeacherError {
  code: string;
  message: string;
  field?: string;
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TeacherError | null>(null);

  const handleError = (err: unknown): TeacherError => {
    if (err instanceof Error) {
      // Erro de autenticação do Supabase
      if ((err as any).status === 400) {
        return {
          code: 'auth/invalid-credentials',
          message: 'Credenciais inválidas. Verifique os dados informados.'
        };
      }
      
      // Erro de email duplicado
      if ((err as PostgrestError).code === '23505' && (err as PostgrestError).message.includes('email')) {
        return {
          code: 'auth/email-already-exists',
          message: 'Este email já está em uso.',
          field: 'email'
        };
      }

      // Erro de escola inválida
      if ((err as PostgrestError).code === '23503' && (err as PostgrestError).message.includes('school_id')) {
        return {
          code: 'db/invalid-school',
          message: 'A escola selecionada é inválida.',
          field: 'school_id'
        };
      }
    }

    // Erro genérico
    return {
      code: 'unknown',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    };
  };

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError);
      console.error('Erro ao carregar professores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeacher = useCallback(async (teacherData: CreateTeacherData) => {
    setLoading(true);
    setError(null);
    try {
      const newTeacher = await teachersApi.create(teacherData);
      setTeachers(prev => [...prev, newTeacher]);
      return { success: true, data: newTeacher };
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError);
      console.error('Erro ao criar professor:', err);
      return { success: false, error: formattedError };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeacher = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await teachersApi.delete(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      const formattedError = handleError(err);
      setError(formattedError);
      console.error('Erro ao excluir professor:', err);
      return { success: false, error: formattedError };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    deleteTeacher,
    clearError
  };
}