-- Create temporary table to store existing user data
CREATE TEMP TABLE users_temp AS 
SELECT * FROM users;

-- Drop existing users table and related objects
DROP TABLE users CASCADE;

-- Recreate users table with all required columns
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  school_id UUID REFERENCES schools(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT
);

-- Copy data back from temporary table with default email
INSERT INTO users (
  id, 
  full_name, 
  role, 
  school_id, 
  active, 
  created_at, 
  updated_at,
  email
)
SELECT 
  id, 
  full_name, 
  role, 
  school_id, 
  COALESCE(active, true), 
  COALESCE(created_at, now()), 
  COALESCE(updated_at, now()),
  'admin@example.com' -- Set default email for all existing users
FROM users_temp;

-- Create unique index on email
CREATE UNIQUE INDEX users_email_unique ON users(email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Ensure admin user exists with email
INSERT INTO users (id, full_name, email, role)
VALUES (
  '84bbe9f7-7d57-426b-8235-c792b35dc589',
  'Administrator',
  'admin@example.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  role = 'admin'
WHERE users.id = '84bbe9f7-7d57-426b-8235-c792b35dc589';