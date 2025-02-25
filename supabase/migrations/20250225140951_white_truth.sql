/*
  # Atualização da tabela de usuários

  1. Alterações
    - Adiciona coluna email
    - Garante que email seja único
    - Atualiza políticas de segurança

  2. Segurança
    - Políticas RLS para visualização e gerenciamento
*/

-- Primeiro, verifica e adiciona a coluna email se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT;
  END IF;
END $$;

-- Adiciona o índice único se não existir
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

-- Recria as políticas de segurança
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