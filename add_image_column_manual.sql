-- Script SQL para adicionar coluna de imagem à tabela community_posts
-- Execute este script no painel do Supabase (SQL Editor)

-- Adicionar coluna de imagem à tabela community_posts
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN community_posts.image_url IS 'URL da imagem anexada ao post (opcional)';

-- Criar índice para melhorar performance em consultas que filtram por posts com imagem
CREATE INDEX IF NOT EXISTS idx_community_posts_with_image 
ON community_posts(image_url) 
WHERE image_url IS NOT NULL;

-- Verificar se a coluna foi adicionada com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
AND column_name = 'image_url';