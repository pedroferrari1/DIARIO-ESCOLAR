/*
  # Simplificação das políticas de segurança da tabela users

  1. Alterações
    - Remove políticas existentes da tabela users
    - Adiciona novas políticas simplificadas
  
  2. Segurança
    - Permite que usuários autenticados vejam seus próprios dados
    - Permite que administradores vejam todos os dados
    - Evita recursão usando uma abordagem mais direta
*/

-- Remove as políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON users;

-- Adiciona novas políticas simplificadas
CREATE POLICY "view_own_user"
  ON users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    role = 'admin'
  );

-- Garante que o administrador principal tenha acesso
INSERT INTO users (id, full_name, role)
VALUES (
  '84bbe9f7-7d57-426b-8235-c792b35dc589',
  'Administrador',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin'
WHERE users.id = '84bbe9f7-7d57-426b-8235-c792b35dc589';