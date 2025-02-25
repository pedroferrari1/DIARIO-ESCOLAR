/*
  # Add email column to users table and update views

  1. Changes
    - Add email column to users table
    - Update admin_user_activities view
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add email column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT;
    CREATE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- Drop the existing view if it exists
DROP VIEW IF EXISTS admin_user_activities;

-- Recreate the view without the email field for now
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