/*
  # Set specific user as administrator
  
  1. Changes
    - Sets user with ID 84bbe9f7-7d57-426b-8235-c792b35dc589 as administrator
    
  2. Notes
    - This is a one-time operation to set up the initial admin user
    - The user must already exist in auth.users
*/

INSERT INTO users (id, full_name, role)
VALUES (
  '84bbe9f7-7d57-426b-8235-c792b35dc589',
  'Administrator',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin'
WHERE users.id = '84bbe9f7-7d57-426b-8235-c792b35dc589';