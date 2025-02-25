/*
  # School Diary System Schema

  1. New Tables
    - users (authentication and user profiles)
    - schools (school information)
    - teachers (teacher profiles)
    - classes (class/turma information)
    - students (student profiles)
    - attendance (attendance records)
    - observations (student observations/notes)
    - class_teachers (junction table for classes-teachers many-to-many relationship)

  2. Security
    - Enable RLS on all tables
    - Create policies for different user roles (admin, school, teacher)
    - Set up foreign key relationships
    
  3. Enums and Extensions
    - Create user_role enum type
    - Create observation_category enum type
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'school', 'teacher');
CREATE TYPE observation_category AS ENUM ('performance', 'behavior', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  school_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to users table after schools table is created
ALTER TABLE users ADD CONSTRAINT fk_users_school
  FOREIGN KEY (school_id) REFERENCES schools(id)
  ON DELETE SET NULL;

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  school_id UUID NOT NULL REFERENCES schools(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table for classes and teachers
CREATE TABLE class_teachers (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (class_id, teacher_id)
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  date DATE NOT NULL,
  is_present BOOLEAN NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Observations table
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  category observation_category NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Schools policies
CREATE POLICY "Public can view schools"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schools"
  ON schools FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Teachers policies
CREATE POLICY "School admins can manage their teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (role = 'admin' OR (role = 'school' AND school_id = teachers.school_id))
    )
  );

-- Classes policies
CREATE POLICY "Teachers can view their classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      JOIN class_teachers ON teachers.id = class_teachers.teacher_id
      WHERE teachers.user_id = auth.uid()
      AND class_teachers.class_id = classes.id
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (role = 'admin' OR (role = 'school' AND school_id = classes.school_id))
    )
  );

-- Students policies
CREATE POLICY "Teachers can view their students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      JOIN class_teachers ON teachers.id = class_teachers.teacher_id
      WHERE teachers.user_id = auth.uid()
      AND class_teachers.class_id = students.class_id
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (role = 'admin' OR (role = 'school' AND school_id = (
        SELECT school_id FROM classes WHERE id = students.class_id
      )))
    )
  );

-- Attendance policies
CREATE POLICY "Teachers can manage attendance for their students"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      JOIN class_teachers ON teachers.id = class_teachers.teacher_id
      JOIN students ON class_teachers.class_id = students.class_id
      WHERE teachers.user_id = auth.uid()
      AND students.id = attendance.student_id
    )
  );

-- Observations policies
CREATE POLICY "Teachers can manage their observations"
  ON observations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = observations.teacher_id
    )
  );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();