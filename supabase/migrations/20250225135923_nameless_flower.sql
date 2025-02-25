/*
  # Funções para o Dashboard de Frequência

  1. Novas Funções
    - fn_get_daily_attendance: Retorna estatísticas diárias de frequência
    - fn_get_class_attendance: Retorna estatísticas por turma
    - fn_get_critical_students: Retorna alunos com frequência abaixo do mínimo
    - fn_get_attendance_summary: Retorna resumo geral de frequência

  2. Segurança
    - Todas as funções são SECURITY DEFINER
    - Políticas RLS existentes controlam acesso aos dados
*/

-- Função para obter estatísticas diárias de frequência
CREATE OR REPLACE FUNCTION fn_get_daily_attendance(
  p_days INTEGER,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  presenca NUMERIC,
  total_alunos INTEGER
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      a.date,
      COUNT(*) FILTER (WHERE a.is_present) AS presentes,
      COUNT(*) AS total
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    WHERE 
      a.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
    GROUP BY a.date
  )
  SELECT
    ds.date,
    ROUND((ds.presentes::NUMERIC / ds.total::NUMERIC) * 100, 2) AS presenca,
    ds.total AS total_alunos
  FROM daily_stats ds
  ORDER BY ds.date;
END;
$$;

-- Função para obter estatísticas por turma
CREATE OR REPLACE FUNCTION fn_get_class_attendance(
  p_days INTEGER
)
RETURNS TABLE (
  class_id UUID,
  class_name TEXT,
  attendance_rate NUMERIC,
  total_students INTEGER
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH class_stats AS (
    SELECT 
      c.id AS class_id,
      c.name AS class_name,
      COUNT(DISTINCT s.id) AS total_students,
      COUNT(*) FILTER (WHERE a.is_present)::NUMERIC / COUNT(*)::NUMERIC * 100 AS attendance_rate
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    LEFT JOIN attendance a ON a.student_id = s.id
    WHERE a.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY c.id, c.name
  )
  SELECT 
    cs.class_id,
    cs.class_name,
    ROUND(cs.attendance_rate, 2) AS attendance_rate,
    cs.total_students
  FROM class_stats cs
  ORDER BY cs.attendance_rate DESC;
END;
$$;

-- Função para obter alunos em situação crítica
CREATE OR REPLACE FUNCTION fn_get_critical_students(
  p_min_attendance NUMERIC
)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  class_id UUID,
  class_name TEXT,
  attendance_rate NUMERIC
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH student_stats AS (
    SELECT 
      s.id AS student_id,
      s.name AS student_name,
      c.id AS class_id,
      c.name AS class_name,
      COUNT(*) FILTER (WHERE a.is_present)::NUMERIC / COUNT(*)::NUMERIC * 100 AS attendance_rate
    FROM students s
    JOIN classes c ON c.id = s.class_id
    LEFT JOIN attendance a ON a.student_id = s.id
    WHERE a.date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY s.id, s.name, c.id, c.name
    HAVING COUNT(*) FILTER (WHERE a.is_present)::NUMERIC / COUNT(*)::NUMERIC * 100 < p_min_attendance
  )
  SELECT 
    ss.student_id,
    ss.student_name,
    ss.class_id,
    ss.class_name,
    ROUND(ss.attendance_rate, 2) AS attendance_rate
  FROM student_stats ss
  ORDER BY ss.attendance_rate;
END;
$$;

-- Função para obter resumo geral de frequência
CREATE OR REPLACE FUNCTION fn_get_attendance_summary(
  p_days INTEGER,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  presenca_media NUMERIC,
  total_aulas INTEGER,
  faltas_justificadas NUMERIC
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(
      COUNT(*) FILTER (WHERE a.is_present)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100,
      2
    ) AS presenca_media,
    COUNT(DISTINCT a.date) AS total_aulas,
    ROUND(
      COUNT(*) FILTER (WHERE NOT a.is_present AND a.reason IS NOT NULL)::NUMERIC / 
      NULLIF(COUNT(*) FILTER (WHERE NOT a.is_present), 0)::NUMERIC * 100,
      2
    ) AS faltas_justificadas
  FROM attendance a
  JOIN students s ON s.id = a.student_id
  WHERE 
    a.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    AND (p_class_id IS NULL OR s.class_id = p_class_id);
END;
$$;