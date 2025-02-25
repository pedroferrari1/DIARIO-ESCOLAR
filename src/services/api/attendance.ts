import { supabase } from '../../lib/supabase';
import { cacheManager } from '../../lib/cache';
import { Attendance } from '../../types/database';

const CACHE_KEYS = {
  STUDENT_ATTENDANCE: (studentId: string) => `attendance:student:${studentId}`,
  CLASS_ATTENDANCE: (classId: string, date: string) => `attendance:class:${classId}:${date}`,
};

export const attendanceApi = {
  async getStudentAttendance(studentId: string, startDate: string, endDate: string) {
    const cacheKey = `${CACHE_KEYS.STUDENT_ATTENDANCE(studentId)}:${startDate}:${endDate}`;
    
    return cacheManager.getOrFetch(cacheKey, async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Attendance[];
    });
  },

  async getClassAttendance(classId: string, date: string) {
    return cacheManager.getOrFetch(CACHE_KEYS.CLASS_ATTENDANCE(classId, date), async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(id, name)
        `)
        .eq('date', date)
        .in('student_id', supabase
          .from('students')
          .select('id')
          .eq('class_id', classId)
        );

      if (error) throw error;
      return data;
    });
  },

  async markAttendance(attendance: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendance)
      .select()
      .single();

    if (error) throw error;
    
    // Invalida os caches relacionados
    cacheManager.invalidate(CACHE_KEYS.STUDENT_ATTENDANCE(attendance.student_id));
    const student = await supabase
      .from('students')
      .select('class_id')
      .eq('id', attendance.student_id)
      .single();
    if (student?.data?.class_id) {
      cacheManager.invalidate(CACHE_KEYS.CLASS_ATTENDANCE(student.data.class_id, attendance.date));
    }

    return data as Attendance;
  },

  async bulkMarkAttendance(attendances: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendances)
      .select();

    if (error) throw error;

    // Invalida os caches relacionados
    attendances.forEach(attendance => {
      cacheManager.invalidate(CACHE_KEYS.STUDENT_ATTENDANCE(attendance.student_id));
    });

    return data as Attendance[];
  }
};