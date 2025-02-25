/*
  # Add email column to users table

  1. Changes
    - Add `email` column to users table
    - Make email unique and required
    - Add index for faster lookups
    
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
    ALTER TABLE users ADD COLUMN email TEXT NOT NULL UNIQUE;
    CREATE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- Update the admin_user_activities view to include email
CREATE OR REPLACE VIEW admin_user_activities AS
SELECT
  ua.id,
  ua.activity_type,
  ua.description,
  ua.created_at,
  u.full_name as user_name,
  u.email as user_email,
  u.role as user_role
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;