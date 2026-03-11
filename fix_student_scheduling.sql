-- ============================================================
-- SCRIPT: fix_student_scheduling.sql
-- OBJETIVO: Corrigir permissões para alunos agendarem aulas
--           e criar tabelas de disponibilidade se não existirem.
-- INSTRUÇÕES: Rode este script inteiro no SQL Editor do Supabase.
-- ============================================================


-- 1. PERMISSÃO DE INSERT PARA ALUNOS NA TABELA LESSONS
--    (Aluno só pode inserir uma aula onde student_id = auth.uid())
DROP POLICY IF EXISTS "Students can insert their own lessons" ON lessons;

CREATE POLICY "Students can insert their own lessons"
  ON lessons
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
  );


-- 2. CRIAR TABELA DE DISPONIBILIDADE SEMANAL (se não existir)
CREATE TABLE IF NOT EXISTS availability_weekly (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sabado
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE availability_weekly ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar disponibilidade" ON availability_weekly;
CREATE POLICY "Admins podem gerenciar disponibilidade"
  ON availability_weekly FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Todos podem ver disponibilidade" ON availability_weekly;
CREATE POLICY "Todos podem ver disponibilidade"
  ON availability_weekly FOR SELECT USING (true);


-- 3. CRIAR TABELA DE DATAS BLOQUEADAS (se não existir)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  reason text,
  start_time time,
  end_time time,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar datas bloqueadas" ON blocked_dates;
CREATE POLICY "Admins podem gerenciar datas bloqueadas"
  ON blocked_dates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Todos podem ver datas bloqueadas" ON blocked_dates;
CREATE POLICY "Todos podem ver datas bloqueadas"
  ON blocked_dates FOR SELECT USING (true);


-- 4. INSERIR DISPONIBILIDADE PADRÃO (todos os dias 16:15-21:15)
--    (Só insere se a tabela estiver vazia)
INSERT INTO availability_weekly (day_of_week, start_time, end_time)
SELECT day_of_week, '16:15', '21:15'
FROM generate_series(0, 6) AS day_of_week
WHERE NOT EXISTS (SELECT 1 FROM availability_weekly LIMIT 1);
