/*
  # Fix admin activities view

  1. Changes
    - Create admin_user_activities view if it doesn't exist
    - Ensure proper joins and column selection
    - Add proper ordering
*/

-- Drop view if it exists
DROP VIEW IF EXISTS admin_user_activities;

-- Create view for admin dashboard activities
CREATE VIEW admin_user_activities AS
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

-- Grant necessary permissions
GRANT SELECT ON admin_user_activities TO authenticated;

-- Create index to improve view performance
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at 
ON user_activities(created_at DESC);