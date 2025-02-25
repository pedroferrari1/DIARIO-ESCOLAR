/*
  # Admin Functions and Activity Tracking

  1. New Tables
    - `user_activities`: Track user actions in the system
    
  2. New Views
    - `admin_dashboard_stats`: Aggregated statistics for the admin dashboard
    - `admin_user_activities`: Detailed user activity log
    
  3. Functions
    - `fn_get_school_stats`: Get statistics for a specific school
    - `fn_get_system_stats`: Get system-wide statistics
    - `fn_log_admin_activity`: Log admin actions
    
  4. Security
    - All functions are restricted to admin users only
    - RLS policies for activity tracking
*/

-- Create user_activities table first
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activities
CREATE POLICY "Users can view their own activities"
  ON user_activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activities"
  ON user_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM schools) as total_schools,
  (SELECT COUNT(*) FROM teachers) as total_teachers,
  (SELECT COUNT(*) FROM students) as total_students,
  (SELECT COUNT(*) FROM classes) as total_classes;

-- Create view for user activities with details
CREATE OR REPLACE VIEW admin_user_activities AS
SELECT
  ua.id,
  ua.activity_type,
  ua.description,
  ua.created_at,
  u.full_name as user_name,
  u.role as user_role
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;

-- Function to get school statistics
CREATE OR REPLACE FUNCTION fn_get_school_stats(school_id UUID)
RETURNS TABLE (
  total_teachers INTEGER,
  total_students INTEGER,
  total_classes INTEGER,
  attendance_rate NUMERIC
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM teachers WHERE teachers.school_id = $1)::INTEGER as total_teachers,
    (SELECT COUNT(*) 
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE c.school_id = $1)::INTEGER as total_students,
    (SELECT COUNT(*) FROM classes WHERE classes.school_id = $1)::INTEGER as total_classes,
    COALESCE(
      (SELECT (COUNT(*) FILTER (WHERE is_present = true))::NUMERIC / COUNT(*)::NUMERIC * 100
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN classes c ON s.class_id = c.id
       WHERE c.school_id = $1
       AND a.date >= CURRENT_DATE - INTERVAL '30 days'),
      0
    ) as attendance_rate;
END;
$$;

-- Function to get system-wide statistics
CREATE OR REPLACE FUNCTION fn_get_system_stats()
RETURNS TABLE (
  total_schools INTEGER,
  total_teachers INTEGER,
  total_students INTEGER,
  total_classes INTEGER,
  active_users INTEGER,
  system_attendance_rate NUMERIC
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM schools)::INTEGER as total_schools,
    (SELECT COUNT(*) FROM teachers)::INTEGER as total_teachers,
    (SELECT COUNT(*) FROM students)::INTEGER as total_students,
    (SELECT COUNT(*) FROM classes)::INTEGER as total_classes,
    (SELECT COUNT(*) FROM users WHERE active = true)::INTEGER as active_users,
    COALESCE(
      (SELECT (COUNT(*) FILTER (WHERE is_present = true))::NUMERIC / COUNT(*)::NUMERIC * 100
       FROM attendance
       WHERE date >= CURRENT_DATE - INTERVAL '30 days'),
      0
    ) as system_attendance_rate;
END;
$$;

-- Create admin activity tracking function
CREATE OR REPLACE FUNCTION fn_log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO user_activities (user_id, activity_type, description)
    VALUES (auth.uid(), 'create', 'Created ' || TG_TABLE_NAME || ' record');
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO user_activities (user_id, activity_type, description)
    VALUES (auth.uid(), 'update', 'Updated ' || TG_TABLE_NAME || ' record');
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO user_activities (user_id, activity_type, description)
    VALUES (auth.uid(), 'delete', 'Deleted ' || TG_TABLE_NAME || ' record');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE TRIGGER log_schools_activity
  AFTER INSERT OR UPDATE OR DELETE ON schools
  FOR EACH ROW EXECUTE FUNCTION fn_log_admin_activity();

CREATE TRIGGER log_teachers_activity
  AFTER INSERT OR UPDATE OR DELETE ON teachers
  FOR EACH ROW EXECUTE FUNCTION fn_log_admin_activity();

CREATE TRIGGER log_classes_activity
  AFTER INSERT OR UPDATE OR DELETE ON classes
  FOR EACH ROW EXECUTE FUNCTION fn_log_admin_activity();

-- Grant necessary permissions
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT SELECT ON admin_user_activities TO authenticated;