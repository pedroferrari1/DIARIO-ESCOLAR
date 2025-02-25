import { useState, useCallback } from 'react';
import { Teacher } from '../types/database';
import { teachersApi } from '../services/api/teachers';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (err) {
      setError('Erro ao carregar professores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeacher = useCallback(async (teacher: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newTeacher = await teachersApi.create(teacher);
      setTeachers(prev => [...prev, newTeacher]);
      return newTeacher;
    } catch (err) {
      setError('Erro ao criar professor');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTeacher = useCallback(async (id: string, teacher: Partial<Teacher>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTeacher = await teachersApi.update(id, teacher);
      setTeachers(prev => prev.map(t => t.id === id ? updatedTeacher : t));
      return updatedTeacher;
    } catch (err) {
      setError('Erro ao atualizar professor');
      console.error(err);
      throw err;
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
    } catch (err) {
      setError('Erro ao excluir professor');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
  };
}