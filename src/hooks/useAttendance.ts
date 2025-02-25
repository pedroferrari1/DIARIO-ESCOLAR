import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays } from 'date-fns';

export interface AttendanceStats {
  dailyAttendance: {
    date: string;
    presenca: number;
    ausencia: number;
  }[];
  monthlyAttendance: {
    turma: string;
    presenca: number;
    ausencia: number;
  }[];
  classAttendance: {
    name: string;
    value: number;
  }[];
  criticalStudents: {
    id: string;
    aluno: string;
    turma: string;
    frequencia: number;
  }[];
  summary: {
    presencaMedia: number;
    totalAulas: number;
    alunosRisco: number;
    faltasJustificadas: number;
  };
}

export function useAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  const fetchAttendanceStats = useCallback(async (
    days: number = 30,
    classId?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Buscar estatísticas diárias
      const { data: dailyData, error: dailyError } = await supabase
        .rpc('fn_get_daily_attendance', {
          p_days: days,
          p_class_id: classId
        });

      if (dailyError) throw dailyError;

      // Buscar estatísticas por turma
      const { data: classData, error: classError } = await supabase
        .rpc('fn_get_class_attendance', {
          p_days: days
        });

      if (classError) throw classError;

      // Buscar alunos em situação crítica
      const { data: criticalData, error: criticalError } = await supabase
        .rpc('fn_get_critical_students', {
          p_min_attendance: 75
        });

      if (criticalError) throw criticalError;

      // Buscar resumo geral
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('fn_get_attendance_summary', {
          p_days: days,
          p_class_id: classId
        });

      if (summaryError) throw summaryError;

      setStats({
        dailyAttendance: dailyData.map((d: any) => ({
          date: format(new Date(d.date), 'dd/MM'),
          presenca: d.presenca,
          ausencia: 100 - d.presenca
        })),
        monthlyAttendance: classData.map((d: any) => ({
          turma: d.class_name,
          presenca: d.attendance_rate,
          ausencia: 100 - d.attendance_rate
        })),
        classAttendance: [
          { name: 'Presentes', value: summaryData.presenca_media },
          { name: 'Ausentes', value: 100 - summaryData.presenca_media }
        ],
        criticalStudents: criticalData.map((d: any) => ({
          id: d.student_id,
          aluno: d.student_name,
          turma: d.class_name,
          frequencia: d.attendance_rate
        })),
        summary: {
          presencaMedia: summaryData.presenca_media,
          totalAulas: summaryData.total_aulas,
          alunosRisco: criticalData.length,
          faltasJustificadas: summaryData.faltas_justificadas
        }
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas de frequência:', err);
      setError('Erro ao carregar estatísticas de frequência');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (
    studentId: string,
    date: string,
    isPresent: boolean,
    justification?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          date,
          is_present: isPresent,
          reason: justification
        });

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao registrar frequência:', err);
      setError('Erro ao registrar frequência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkMarkAttendance = useCallback(async (
    attendanceData: {
      studentId: string;
      date: string;
      isPresent: boolean;
      justification?: string;
    }[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert(
          attendanceData.map(d => ({
            student_id: d.studentId,
            date: d.date,
            is_present: d.isPresent,
            reason: d.justification
          }))
        );

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao registrar frequência em lote:', err);
      setError('Erro ao registrar frequência em lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchAttendanceStats,
    markAttendance,
    bulkMarkAttendance
  };
}