/*
  # Correção da tabela de usuários

  1. Alterações
    - Adiciona coluna `email` como TEXT NOT NULL
    - Adiciona coluna `active` como BOOLEAN NOT NULL DEFAULT true
    - Cria índice para a coluna email
    - Atualiza a view admin_user_activities

  2. Segurança
    - Mantém as políticas RLS existentes
*/

-- Adiciona coluna email se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT NOT NULL;
    CREATE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- Adiciona coluna active se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'active'
  ) THEN
    ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- Recria a view admin_user_activities
DROP VIEW IF EXISTS admin_user_activities;
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

-- Atualiza a função de estatísticas do sistema
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