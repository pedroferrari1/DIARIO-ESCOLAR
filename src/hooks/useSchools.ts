import { useState, useCallback } from 'react';
import { School } from '../types/database';
import { schoolsApi } from '../services/api/schools';

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolsApi.getAll();
      setSchools(data);
    } catch (err) {
      setError('Erro ao carregar escolas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchool = useCallback(async (school: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newSchool = await schoolsApi.create(school);
      setSchools(prev => [...prev, newSchool]);
      return newSchool;
    } catch (err) {
      setError('Erro ao criar escola');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchool = useCallback(async (id: string, school: Partial<School>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSchool = await schoolsApi.update(id, school);
      setSchools(prev => prev.map(s => s.id === id ? updatedSchool : s));
      return updatedSchool;
    } catch (err) {
      setError('Erro ao atualizar escola');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchool = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await schoolsApi.delete(id);
      setSchools(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Erro ao excluir escola');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool
  };
}