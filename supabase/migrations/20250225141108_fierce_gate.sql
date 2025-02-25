/*
  # Fix users table email column

  1. Changes
    - Drop existing email column if exists
    - Add email column with proper constraints
    - Update security policies

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing email column and constraints if they exist
DO $$ 
BEGIN
  -- Drop existing index if exists
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'users'
    AND indexname = 'users_email_unique'
  ) THEN
    DROP INDEX users_email_unique;
  END IF;

  -- Drop email column if exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE users DROP COLUMN email;
  END IF;
END $$;

-- Add email column with proper constraints
ALTER TABLE users 
ADD COLUMN email TEXT;

-- Create unique index
CREATE UNIQUE INDEX users_email_unique ON users(email);

-- Update security policies
DROP POLICY IF EXISTS "view_own_user" ON users;
DROP POLICY IF EXISTS "admins_manage_users" ON users;

CREATE POLICY "view_own_user"
  ON users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "admins_manage_users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update existing admin user with email if needed
UPDATE users 
SET email = 'admin@example.com'
WHERE id = '84bbe9f7-7d57-426b-8235-c792b35dc589'
AND email IS NULL;