-- PARA CORRIGIR O ERRO DE PERDIÇÃO:
-- Execute este script no Editor SQL do Supabase.

-- Opção 1: Promover TODOS os usuários atuais para admin (Recomendado para teste)
UPDATE profiles SET role = 'admin';

-- Opção 2: Promover apenas seu usuário específico (Descomente e edite se preferir)
-- UPDATE profiles SET role = 'admin' WHERE email = 'seu_email@exemplo.com';
