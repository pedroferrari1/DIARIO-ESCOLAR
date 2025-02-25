/*
  # Correção das políticas de segurança da tabela users

  1. Alterações
    - Remove políticas existentes da tabela users
    - Adiciona novas políticas sem recursão
  
  2. Segurança
    - Permite que usuários autenticados vejam seus próprios dados
    - Permite que administradores vejam todos os dados
    - Evita recursão infinita nas políticas
*/

-- Remove as políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Adiciona novas políticas sem recursão
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Administradores podem ver todos os usuários"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = '84bbe9f7-7d57-426b-8235-c792b35dc589'
    OR
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM users WHERE role = 'admin'
      )
    )
  );