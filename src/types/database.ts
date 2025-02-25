export type UserRole = 'admin' | 'school' | 'teacher';
export type ObservationCategory = 'performance' | 'behavior' | 'other';
export type ActivityType = 'create' | 'update' | 'delete' | 'login' | 'logout';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  school_id: string | null;
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by: string;
}

export interface School {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  is_present: boolean;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Observation {
  id: string;
  student_id: string;
  teacher_id: string;
  category: ObservationCategory;
  content: string;
  created_at: string;
  updated_at: string;
}