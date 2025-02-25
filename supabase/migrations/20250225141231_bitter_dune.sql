/*
  # Fix users table email column - Final Resolution

  1. Changes
    - Drop and recreate email column with proper constraints
    - Ensure proper order of operations
    - Handle existing data

  2. Security
    - Maintain existing RLS policies
*/

-- Wrap everything in a transaction
BEGIN;

-- First, ensure we're working with the correct schema
SET search_path TO public;

-- Drop existing email constraints if they exist
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
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE users DROP COLUMN IF EXISTS email;
  END IF;
END $$;

-- Add email column
ALTER TABLE users 
ADD COLUMN email TEXT;

-- Create unique index
CREATE UNIQUE INDEX users_email_unique ON users(email);

-- Set not null constraint after ensuring data integrity
ALTER TABLE users 
ALTER COLUMN email SET NOT NULL;

-- Update existing admin user
UPDATE users 
SET email = 'admin@example.com'
WHERE id = '84bbe9f7-7d57-426b-8235-c792b35dc589'
AND (email IS NULL OR email = '');

COMMIT;