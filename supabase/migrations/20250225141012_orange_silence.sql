/*
  # Add email column to users table

  1. Changes
    - Add email column if it doesn't exist
    - Add unique constraint for email
    - Update security policies

  2. Security
    - Policies for viewing and managing users
*/

-- First, check if the email column exists and add it if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    -- Add the column as nullable first
    ALTER TABLE users ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create unique index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'users'
    AND indexname = 'users_email_unique'
  ) THEN
    CREATE UNIQUE INDEX users_email_unique ON users(email);
  END IF;
END $$;

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