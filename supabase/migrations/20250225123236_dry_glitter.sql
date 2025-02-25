/*
  # Update system stats function

  1. Changes
    - Fix active users count in fn_get_system_stats
    
  2. Security
    - Maintain existing security settings
*/

-- Update the system stats function to properly handle active users
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
      (SELECT (COUNT(*) FILTER (WHERE is_present = true))::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100
       FROM attendance
       WHERE date >= CURRENT_DATE - INTERVAL '30 days'),
      0
    ) as system_attendance_rate;
END;
$$;