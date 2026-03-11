-- ============================================================
-- SCRIPT: add_pix_column.sql
-- OBJETIVO: Adicionar coluna para a Professora salvar a chave PIX dela
-- INSTRUÇÕES: Rode este script inteiro no SQL Editor do Supabase.
-- ============================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pix_key text;

COMMENT ON COLUMN profiles.pix_key IS 'Chave PIX da professora para recebimentos.';
