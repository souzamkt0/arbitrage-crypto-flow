-- Script para adicionar coluna de foto de perfil no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar coluna para URL da foto de perfil na tabela de usuários
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Comentário: Esta coluna armazenará a URL da foto de perfil do usuário
-- Pode ser uma URL do Supabase Storage ou externa
-- Exemplo de uso: UPDATE auth.users SET profile_photo_url = 'https://...' WHERE id = 'user-id';

-- Opcional: Criar índice para melhor performance em consultas
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON auth.users(profile_photo_url);

-- Verificar se a coluna foi criada com sucesso
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'auth' AND column_name = 'profile_photo_url';