/*
  # Sistema de Configurações

  1. Nova Tabela
    - system_settings: Armazena configurações globais do sistema
      - id (uuid, primary key)
      - key (text, unique)
      - value (text)
      - description (text)
      - updated_at (timestamp)
      - updated_by (uuid, referencia users)

  2. Segurança
    - Enable RLS
    - Políticas de acesso para administradores
*/

-- Create system_settings table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Todos podem visualizar configurações"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas administradores podem modificar configurações"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('school.max_students', '1000', 'Número máximo de alunos por escola'),
  ('class.max_students', '40', 'Número máximo de alunos por turma'),
  ('attendance.lock_after_days', '7', 'Dias para bloquear alteração de presença'),
  ('notification.email_enabled', 'true', 'Habilitar notificações por email'),
  ('system.maintenance_mode', 'false', 'Modo de manutenção'),
  ('system.timezone', 'America/Sao_Paulo', 'Fuso horário do sistema')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION fn_update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_system_settings_timestamp();