-- Criar tabela de dúvidas (doubts)
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)

-- 1. Alunos podem ver apenas suas próprias dúvidas
CREATE POLICY "Alunos veem suas próprias dúvidas" 
ON public.doubts 
FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

-- 2. Alunos podem inserir suas próprias dúvidas
CREATE POLICY "Alunos inserem suas próprias dúvidas" 
ON public.doubts 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

-- 3. Professora (Admin) pode ver todas as dúvidas
CREATE POLICY "Admin vê todas as dúvidas" 
ON public.doubts 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Professora (Admin) pode atualizar (responder) dúvidas
CREATE POLICY "Admin responde dúvidas" 
ON public.doubts 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
