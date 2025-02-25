/*
  # Correção da tabela de usuários

  1. Alterações
    - Adiciona coluna email como NOT NULL
    - Adiciona índice único para email
    - Garante que email seja único

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
    CREATE UNIQUE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- Atualiza a estrutura da tabela users
ALTER TABLE users
ALTER COLUMN email SET NOT NULL,
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Recria as políticas de segurança
DROP POLICY IF EXISTS "view_own_user" ON users;

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