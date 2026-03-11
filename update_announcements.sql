-- ============================================================
-- SCRIPT: update_announcements.sql
-- OBJETIVO: Permitir que avisos sejam enviados para alunos específicos
-- INSTRUÇÕES: Rode este script no SQL Editor do Supabase.
-- ============================================================

-- 1. Adicionar coluna student_id (uuid)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

COMMENT ON COLUMN announcements.student_id IS 'Indica para qual aluno específico o aviso foi enviado. Se nulo, o aviso é para todos.';

-- 2. Atualizar as Políticas RLS (Row Level Security) da tabela announcements
--    Precisamos garantir que alunos só leiam avisos caso student_id seja NULL ou igual ao ID dele.
--    Admins leem e escrevem tudo.

DROP POLICY IF EXISTS "Todos podem ver comunicados" ON announcements;
DROP POLICY IF EXISTS "Students can see announcements" ON announcements; -- caso exista com outro nome

-- A professora (admin) continua com poder sobre tudo via política anterior ou criamos uma nova garantia.
-- Garantindo que admin pode gerenciar (CRUD completo) os comunicados
DROP POLICY IF EXISTS "Admins podem gerenciar comunicados" ON announcements;
CREATE POLICY "Admins podem gerenciar comunicados"
  ON announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Alunos só podem LER (SELECT) se o aviso for PÚBLICO (student_id = null) OU direcionado para ELE
CREATE POLICY "Students can see announcements"
  ON announcements FOR SELECT
  USING (
    student_id IS NULL OR student_id = auth.uid()
  );
