-- Adicionar coluna de imagem à tabela community_posts
ALTER TABLE community_posts 
ADD COLUMN image_url TEXT;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN community_posts.image_url IS 'URL da imagem anexada ao post (opcional)';

-- Criar índice para melhorar performance em consultas que filtram por posts com imagem
CREATE INDEX idx_community_posts_with_image ON community_posts(image_url) WHERE image_url IS NOT NULL;