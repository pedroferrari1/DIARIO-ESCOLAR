import { useState, useCallback } from 'react';
import { Class } from '../types/database';
import { classesApi } from '../services/api/classes';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classesApi.getAll();
      setClasses(data);
    } catch (err) {
      setError('Erro ao carregar turmas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClass = useCallback(async (classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newClass = await classesApi.create(classData);
      setClasses(prev => [...prev, newClass]);
      return newClass;
    } catch (err) {
      setError('Erro ao criar turma');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClass = useCallback(async (id: string, classData: Partial<Class>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedClass = await classesApi.update(id, classData);
      setClasses(prev => prev.map(c => c.id === id ? updatedClass : c));
      return updatedClass;
    } catch (err) {
      setError('Erro ao atualizar turma');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await classesApi.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError('Erro ao excluir turma');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeacher = useCallback(async (classId: string, teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      await classesApi.addTeacher(classId, teacherId);
      await fetchClasses(); // Recarrega as turmas para atualizar a lista de professores
    } catch (err) {
      setError('Erro ao adicionar professor');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchClasses]);

  const removeTeacher = useCallback(async (classId: string, teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      await classesApi.removeTeacher(classId, teacherId);
      await fetchClasses(); // Recarrega as turmas para atualizar a lista de professores
    } catch (err) {
      setError('Erro ao remover professor');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    addTeacher,
    removeTeacher
  };
}