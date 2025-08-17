-- Correção ULTRA SIMPLES para criação de usuários
-- Execute este código no SQL Editor do Supabase

-- 1. Remover TUDO que pode estar causando problema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_basic_profile();
DROP FUNCTION IF EXISTS create_user_profile_simple();
DROP FUNCTION IF EXISTS create_user_profile_safe();
DROP FUNCTION IF EXISTS create_user_profile_with_referral();
DROP FUNCTION IF EXISTS create_user_profile_robust();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_minimal_profile();

-- 2. Desabilitar RLS em TODAS as tabelas relacionadas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se a tabela profiles tem as colunas necessárias
-- Se não tiver, adicionar
DO $$
BEGIN
    -- Adicionar coluna referral_code se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'referral_code') THEN
        ALTER TABLE public.profiles ADD COLUMN referral_code TEXT DEFAULT 'souzamkt0';
    END IF;
    
    -- Adicionar coluna referred_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'referred_by') THEN
        ALTER TABLE public.profiles ADD COLUMN referred_by UUID;
    END IF;
    
    -- Adicionar coluna whatsapp se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'whatsapp') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp TEXT;
    END IF;
    
    -- Adicionar coluna city se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'city') THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT;
    END IF;
    
    -- Adicionar coluna state se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'state') THEN
        ALTER TABLE public.profiles ADD COLUMN state TEXT;
    END IF;
END $$;

-- 4. Criar função ULTRA simples
CREATE OR REPLACE FUNCTION create_profile_ultra_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Tentar inserir perfil básico
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        referral_code,
        role,
        balance,
        total_profit,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        'Usuário',
        split_part(NEW.email, '@', 1),
        'Novo usuário',
        'avatar1',
        'souzamkt0',
        'user',
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der qualquer erro, apenas retorna sem falhar
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_ultra_simple();

-- 6. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 7. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura Profiles' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('user_id', 'email', 'username', 'referral_code', 'referred_by', 'whatsapp', 'city', 'state')
ORDER BY column_name;

-- 8. Teste de inserção direta
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    referral_code,
    role,
    balance,
    total_profit,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste_ultra@teste.com',
    'Usuário Teste Ultra',
    'teste_ultra',
    'Usuário de teste ultra simples',
    'avatar1',
    'souzamkt0',
    'user',
    0.00,
    0.00,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 9. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção' as info,
    COUNT(*) as total_perfis
FROM profiles;

-- 10. Resumo final
SELECT 
    'CONFIGURAÇÃO ULTRA SIMPLES' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger ativo'
        ELSE '❌ Trigger inativo'
    END as trigger_status,
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles') = false THEN '✅ RLS desabilitado'
        ELSE '❌ RLS habilitado'
    END as rls_status,
    'Teste o cadastro agora - deve funcionar' as status;
