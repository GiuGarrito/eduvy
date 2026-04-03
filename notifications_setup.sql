-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- 'booking', 'answer', 'payment', 'info'
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas suas próprias notificações
CREATE POLICY "Usuários veem suas próprias notificações"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuário pode marcar as próprias notificações como lidas
CREATE POLICY "Usuários atualizam suas próprias notificações"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Service role pode inserir notificações (via triggers)
CREATE POLICY "Service role insere notificações"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Index para performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);

-- =============================================
-- TRIGGER: Notifica professora quando aluno agenda aula
-- =============================================
CREATE OR REPLACE FUNCTION notify_teacher_on_booking()
RETURNS TRIGGER AS $$
DECLARE
    student_name TEXT;
    teacher_id UUID;
BEGIN
    -- Busca nome do aluno
    SELECT full_name INTO student_name FROM public.profiles WHERE id = NEW.student_id;

    -- Busca o id da professora (admin)
    SELECT id INTO teacher_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

    IF teacher_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            teacher_id,
            'Nova aula agendada',
            COALESCE(student_name, 'Um aluno') || ' agendou uma aula para ' || TO_CHAR(NEW.date::DATE, 'DD/MM/YYYY') || ' às ' || LEFT(NEW.time::TEXT, 5),
            'booking'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger anterior se existir
DROP TRIGGER IF EXISTS on_lesson_booked ON public.lessons;

-- Cria trigger apenas para aulas inseridas pelo aluno (status scheduled)
CREATE TRIGGER on_lesson_booked
    AFTER INSERT ON public.lessons
    FOR EACH ROW
    WHEN (NEW.student_id IS NOT NULL)
    EXECUTE FUNCTION notify_teacher_on_booking();

-- =============================================
-- TRIGGER: Notifica aluno quando professora responde uma dúvida
-- =============================================
CREATE OR REPLACE FUNCTION notify_student_on_answer()
RETURNS TRIGGER AS $$
BEGIN
    -- Só dispara se o campo answer foi preenchido agora
    IF OLD.answer IS NULL AND NEW.answer IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.student_id,
            'Sua dúvida foi respondida!',
            'A professora respondeu: "' || LEFT(NEW.answer, 100) || '"',
            'answer'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger anterior se existir
DROP TRIGGER IF EXISTS on_doubt_answered ON public.doubts;

CREATE TRIGGER on_doubt_answered
    AFTER UPDATE ON public.doubts
    FOR EACH ROW
    EXECUTE FUNCTION notify_student_on_answer();
