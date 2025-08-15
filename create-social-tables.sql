-- Script para criar tabelas da página Social estilo Facebook
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela user_profiles (se não existir)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela social_posts
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    location VARCHAR(100),
    tagged_users UUID[],
    hashtags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela social_comments
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela social_likes
CREATE TABLE IF NOT EXISTS public.social_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_post_like UNIQUE(user_id, post_id),
    CONSTRAINT unique_comment_like UNIQUE(user_id, comment_id),
    CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- 5. Criar tabela social_follows (sistema de seguir/amizade)
CREATE TABLE IF NOT EXISTS public.social_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_follow UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 6. Criar tabela social_shares
CREATE TABLE IF NOT EXISTS public.social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    share_type VARCHAR(20) DEFAULT 'share', -- share, repost
    content TEXT, -- comentário opcional ao compartilhar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON public.social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_post_id ON public.social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user_id ON public.social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_follower ON public.social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following ON public.social_follows(following_id);

-- 8. Configurar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS para user_profiles
CREATE POLICY "Usuários podem ver perfis públicos" ON public.user_profiles
    FOR SELECT USING (is_private = false OR user_id = auth.uid());

CREATE POLICY "Usuários podem criar seu próprio perfil" ON public.user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seu próprio perfil" ON public.user_profiles
    FOR DELETE USING (user_id = auth.uid());

-- 10. Políticas RLS para social_posts
CREATE POLICY "Usuários podem ver posts públicos" ON public.social_posts
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Usuários podem criar seus próprios posts" ON public.social_posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios posts" ON public.social_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus próprios posts" ON public.social_posts
    FOR DELETE USING (user_id = auth.uid());

-- 11. Políticas RLS para social_comments
CREATE POLICY "Usuários podem ver comentários de posts públicos" ON public.social_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.social_posts 
            WHERE id = social_comments.post_id 
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Usuários podem criar comentários" ON public.social_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios comentários" ON public.social_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.social_comments
    FOR DELETE USING (user_id = auth.uid());

-- 12. Políticas RLS para social_likes
CREATE POLICY "Usuários podem ver curtidas" ON public.social_likes
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem curtir" ON public.social_likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem remover suas curtidas" ON public.social_likes
    FOR DELETE USING (user_id = auth.uid());

-- 13. Políticas RLS para social_follows
CREATE POLICY "Usuários podem ver seguidores" ON public.social_follows
    FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Usuários podem seguir outros" ON public.social_follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Usuários podem atualizar status de seguimento" ON public.social_follows
    FOR UPDATE USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Usuários podem parar de seguir" ON public.social_follows
    FOR DELETE USING (follower_id = auth.uid());

-- 14. Políticas RLS para social_shares
CREATE POLICY "Usuários podem ver compartilhamentos" ON public.social_shares
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem compartilhar" ON public.social_shares
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus compartilhamentos" ON public.social_shares
    FOR DELETE USING (user_id = auth.uid());

-- 15. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Triggers para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_comments_updated_at BEFORE UPDATE ON public.social_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_follows_updated_at BEFORE UPDATE ON public.social_follows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 18. Trigger para criar perfil automaticamente
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 19. Função para atualizar contadores
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE public.social_posts 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'social_likes' AND NEW.post_id IS NOT NULL THEN
            UPDATE public.social_posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'social_shares' THEN
            UPDATE public.social_posts 
            SET shares_count = shares_count + 1 
            WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE public.social_posts 
            SET comments_count = comments_count - 1 
            WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'social_likes' AND OLD.post_id IS NOT NULL THEN
            UPDATE public.social_posts 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'social_shares' THEN
            UPDATE public.social_posts 
            SET shares_count = shares_count - 1 
            WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 20. Triggers para atualizar contadores automaticamente
CREATE TRIGGER update_comments_counter
    AFTER INSERT OR DELETE ON public.social_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER update_likes_counter
    AFTER INSERT OR DELETE ON public.social_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER update_shares_counter
    AFTER INSERT OR DELETE ON public.social_shares
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- 21. Criar buckets de storage para imagens e vídeos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('social-images', 'social-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('social-videos', 'social-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg'])
ON CONFLICT (id) DO NOTHING;

-- 22. Políticas de storage para imagens sociais
CREATE POLICY "Usuários podem fazer upload de imagens" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'social-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Imagens são públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'social-images');

CREATE POLICY "Usuários podem deletar suas imagens" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'social-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 23. Políticas de storage para vídeos sociais
CREATE POLICY "Usuários podem fazer upload de vídeos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'social-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Vídeos são públicos" ON storage.objects
    FOR SELECT USING (bucket_id = 'social-videos');

CREATE POLICY "Usuários podem deletar seus vídeos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'social-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Comentários finais
-- Este script cria uma estrutura completa para uma rede social estilo Facebook
-- Inclui posts, comentários, curtidas, seguimentos, compartilhamentos
-- Sistema de permissões RLS configurado
-- Contadores automáticos
-- Storage para imagens e vídeos
-- Perfis de usuário automáticos