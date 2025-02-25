import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'school' | 'teacher';
export type ObservationCategory = 'performance' | 'behavior' | 'other';
export type ActivityType = 'create' | 'update' | 'delete' | 'login' | 'logout';
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface User extends SupabaseUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  school_id: string | null;
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string;
  ip_address: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
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