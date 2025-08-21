-- Corrigir problemas de RLS (Row Level Security)
-- Habilitar RLS para todas as tabelas que têm políticas mas não têm RLS habilitado

-- Verificar quais tabelas têm policies mas não têm RLS habilitado
DO $$
DECLARE
    table_rec RECORD;
BEGIN
    -- Loop através de tabelas que têm policies mas RLS desabilitado
    FOR table_rec IN 
        SELECT DISTINCT schemaname, tablename
        FROM pg_policies p
        LEFT JOIN pg_class c ON c.relname = p.tablename
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = p.schemaname
        WHERE NOT c.relrowsecurity
        AND schemaname = 'public'
    LOOP
        -- Habilitar RLS para cada tabela
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
                      table_rec.schemaname, table_rec.tablename);
        
        RAISE NOTICE 'RLS habilitado para tabela: %.%', 
                     table_rec.schemaname, table_rec.tablename;
    END LOOP;
END $$;

-- Verificar e habilitar RLS especificamente para tabelas conhecidas
ALTER TABLE IF EXISTS public.facebook_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facebook_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partner_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_likes ENABLE ROW LEVEL SECURITY;

-- Limpar triggers duplicados ou problemáticos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Criar um trigger simples e funcional para criação de perfil
CREATE OR REPLACE FUNCTION public.create_user_profile_clean()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        email,
        username,
        display_name,
        bio,
        avatar,
        referral_code,
        role,
        balance,
        total_profit,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        split_part(NEW.email, '@', 1),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'Usuário da plataforma',
        'avatar1',
        'souzamkt0',
        'user',
        0.00,
        0.00,
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der erro, continua sem falhar o cadastro
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger final
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_profile_clean();

-- Remover funções obsoletas e problemáticas
DROP FUNCTION IF EXISTS public.create_user_profile_simple();
DROP FUNCTION IF EXISTS public.create_user_profile_final();
DROP FUNCTION IF EXISTS public.create_user_profile_with_referral();
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.create_user_profile_manual(uuid, text, text, text, text, text, text, text);

-- Verificação final
SELECT 'Problemas de RLS corrigidos!' as status;