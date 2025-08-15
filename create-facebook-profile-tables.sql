-- Script SQL para criar tabelas de perfis estilo Facebook
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Tabela de perfis de usuário (estendida)
CREATE TABLE IF NOT EXISTS public.facebook_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_photo_url TEXT,
    cover_photo_url TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    birth_date DATE,
    relationship_status VARCHAR(20) DEFAULT 'single',
    work VARCHAR(100),
    education VARCHAR(100),
    phone VARCHAR(20),
    email_public BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    photos_count INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    earnings DECIMAL(10,2) DEFAULT 0.00,
    badge VARCHAR(50),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de posts do timeline
CREATE TABLE IF NOT EXISTS public.facebook_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    content TEXT,
    post_type VARCHAR(20) DEFAULT 'text', -- text, photo, video, link, status
    feeling VARCHAR(50), -- emoji + sentimento
    location VARCHAR(100),
    privacy VARCHAR(20) DEFAULT 'public', -- public, friends, private
    media_urls TEXT[], -- array de URLs de mídia
    link_preview JSONB, -- preview de links
    mentions UUID[], -- array de IDs de usuários mencionados
    hashtags TEXT[], -- array de hashtags
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de comentários
CREATE TABLE IF NOT EXISTS public.facebook_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.facebook_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.facebook_comments(id) ON DELETE CASCADE, -- para respostas
    content TEXT NOT NULL,
    media_url TEXT, -- para comentários com imagem/gif
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de curtidas
CREATE TABLE IF NOT EXISTS public.facebook_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- ID do post ou comentário
    target_type VARCHAR(20) NOT NULL, -- 'post' ou 'comment'
    reaction_type VARCHAR(20) DEFAULT 'like', -- like, love, haha, wow, sad, angry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- 5. Tabela de amizades/seguindo
CREATE TABLE IF NOT EXISTS public.facebook_friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- 6. Tabela de álbuns de fotos
CREATE TABLE IF NOT EXISTS public.facebook_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_photo_url TEXT,
    privacy VARCHAR(20) DEFAULT 'public',
    photos_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de fotos
CREATE TABLE IF NOT EXISTS public.facebook_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    album_id UUID REFERENCES public.facebook_albums(id) ON DELETE SET NULL,
    post_id UUID REFERENCES public.facebook_posts(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]', -- tags de pessoas na foto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS public.facebook_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.facebook_posts(id) ON DELETE CASCADE,
    share_text TEXT, -- texto adicional do compartilhamento
    privacy VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- 9. Tabela de notificações
CREATE TABLE IF NOT EXISTS public.facebook_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- like, comment, share, friend_request, mention
    target_id UUID, -- ID do post/comentário relacionado
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de atividades/timeline
CREATE TABLE IF NOT EXISTS public.facebook_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.facebook_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- post_created, photo_uploaded, friend_added, etc.
    target_id UUID, -- ID relacionado à atividade
    metadata JSONB DEFAULT '{}',
    privacy VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_facebook_profiles_user_id ON public.facebook_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_profiles_username ON public.facebook_profiles(username);
CREATE INDEX IF NOT EXISTS idx_facebook_posts_author_id ON public.facebook_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_facebook_posts_created_at ON public.facebook_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_comments_post_id ON public.facebook_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_facebook_likes_target ON public.facebook_likes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_facebook_friendships_users ON public.facebook_friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_facebook_photos_owner_id ON public.facebook_photos(owner_id);
CREATE INDEX IF NOT EXISTS idx_facebook_notifications_recipient ON public.facebook_notifications(recipient_id, read);

-- TRIGGERS para atualizar contadores automaticamente

-- Trigger para atualizar contador de posts
CREATE OR REPLACE FUNCTION update_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.facebook_profiles 
        SET posts_count = posts_count + 1 
        WHERE id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.facebook_profiles 
        SET posts_count = posts_count - 1 
        WHERE id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posts_count
    AFTER INSERT OR DELETE ON public.facebook_posts
    FOR EACH ROW EXECUTE FUNCTION update_posts_count();

-- Trigger para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.facebook_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.facebook_posts 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE ON public.facebook_comments
    FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- Trigger para atualizar contador de curtidas
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE public.facebook_posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE public.facebook_comments 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE public.facebook_posts 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE public.facebook_comments 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON public.facebook_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_facebook_profiles_updated_at
    BEFORE UPDATE ON public.facebook_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_facebook_posts_updated_at
    BEFORE UPDATE ON public.facebook_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE public.facebook_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_activities ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para perfis (simplificadas)
CREATE POLICY "Perfis são visíveis para todos" ON public.facebook_profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar perfis" ON public.facebook_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar perfis" ON public.facebook_profiles
    FOR UPDATE USING (true);

-- Políticas de acesso para posts (simplificadas)
CREATE POLICY "Posts são visíveis para todos" ON public.facebook_posts
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar posts" ON public.facebook_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar posts" ON public.facebook_posts
    FOR UPDATE USING (true);

CREATE POLICY "Usuários podem deletar posts" ON public.facebook_posts
    FOR DELETE USING (true);

-- Políticas para comentários (simplificadas)
CREATE POLICY "Comentários são visíveis para todos" ON public.facebook_comments
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar comentários" ON public.facebook_comments
    FOR INSERT WITH CHECK (true);

-- Políticas para curtidas (simplificadas)
CREATE POLICY "Curtidas são visíveis para todos" ON public.facebook_likes
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem curtir" ON public.facebook_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem remover curtidas" ON public.facebook_likes
    FOR DELETE USING (true);

-- Criar buckets de storage para imagens
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('facebook-profiles', 'facebook-profiles', true),
    ('facebook-posts', 'facebook-posts', true),
    ('facebook-albums', 'facebook-albums', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage (simplificadas)
CREATE POLICY "Imagens de perfil são públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'facebook-profiles');

CREATE POLICY "Upload de imagens de perfil permitido" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'facebook-profiles');

CREATE POLICY "Imagens de posts são públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'facebook-posts');

CREATE POLICY "Upload de imagens de posts permitido" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'facebook-posts');

-- Função para criar perfil automaticamente (removida dependência de auth.users)
-- Esta função pode ser chamada manualmente quando necessário

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO public.facebook_profiles (user_id, username, display_name, bio, verified, followers_count, level, earnings, badge)
VALUES 
    (gen_random_uuid(), 'mariasantos', 'Maria Santos', 'Especialista em trading 📈', true, 2847, 8, 24.50, 'Pro Trader'),
    (gen_random_uuid(), 'carlosoliveira', 'Carlos Oliveira', 'Analista técnico 🚀', true, 5672, 7, 21.80, 'Analista Expert'),
    (gen_random_uuid(), 'anacosta', 'Ana Costa', 'Jovem trader 🚀', false, 1234, 6, 18.90, 'Rising Star')
ON CONFLICT (username) DO NOTHING;

COMMIT;

-- Mensagem de sucesso
SELECT 'Tabelas do Facebook Profile criadas com sucesso! 🎉' as status;