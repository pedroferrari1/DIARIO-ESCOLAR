/*
  # Fix user policies recursion

  1. Changes
    - Remove recursive policies that were causing infinite recursion
    - Simplify admin check to use direct role comparison
    - Add clearer policy names and descriptions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "view_own_user" ON users;
DROP POLICY IF EXISTS "admins_manage_users" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    role = 'admin'
  );

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (role = 'admin');

-- Ensure admin user exists
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