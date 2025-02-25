import { useState, useCallback } from 'react';
import { Student } from '../types/database';
import { studentsApi } from '../services/api/students';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (err) {
      setError('Erro ao carregar alunos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newStudent = await studentsApi.create(student);
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError('Erro ao criar aluno');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(async (id: string, student: Partial<Student>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedStudent = await studentsApi.update(id, student);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      return updatedStudent;
    } catch (err) {
      setError('Erro ao atualizar aluno');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await studentsApi.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Erro ao excluir aluno');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent
  };
}