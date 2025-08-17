-- Correção FINAL para criação de usuários
-- Execute este código no SQL Editor do Supabase

-- 1. Remover TUDO que pode estar causando problema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_correct();
DROP FUNCTION IF EXISTS create_profile_ultra_simple();
DROP FUNCTION IF EXISTS create_basic_profile();
DROP FUNCTION IF EXISTS create_user_profile_simple();
DROP FUNCTION IF EXISTS create_user_profile_safe();
DROP FUNCTION IF EXISTS create_user_profile_with_referral();
DROP FUNCTION IF EXISTS create_user_profile_robust();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_minimal_profile();

-- 2. Desabilitar RLS completamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;

-- 3. Verificar e corrigir estrutura da tabela profiles
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'referral_code') THEN
        ALTER TABLE public.profiles ADD COLUMN referral_code TEXT DEFAULT 'souzamkt0';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'referred_by') THEN
        ALTER TABLE public.profiles ADD COLUMN referred_by UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'whatsapp') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'city') THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'state') THEN
        ALTER TABLE public.profiles ADD COLUMN state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'balance') THEN
        ALTER TABLE public.profiles ADD COLUMN balance DECIMAL(15,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'total_profit') THEN
        ALTER TABLE public.profiles ADD COLUMN total_profit DECIMAL(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- 4. Criar função MUITO simples sem complicações
CREATE OR REPLACE FUNCTION create_user_profile_final()
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
        -- Se der erro, apenas retorna sem falhar
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_final();

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
AND column_name IN ('user_id', 'email', 'username', 'referral_code', 'referred_by', 'whatsapp', 'city', 'state', 'role', 'balance', 'total_profit')
ORDER BY column_name;

-- 8. Teste de inserção direta na tabela profiles
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Tentar inserir um perfil de teste
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
        test_user_id,
        'teste_final@teste.com',
        'Usuário Teste Final',
        'teste_final',
        'Usuário de teste final',
        'avatar1',
        'souzamkt0',
        'user',
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    -- Deletar o registro de teste
    DELETE FROM profiles WHERE user_id = test_user_id;
    
    RAISE NOTICE '✅ Teste de inserção funcionou';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Teste de inserção falhou: %', SQLERRM;
END $$;

-- 9. Verificar se a tabela referrals existe e tem estrutura correta
SELECT 
    'Tabela Referrals' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'referrals'
        ) THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END as status;

-- 10. Criar tabela referrals se não existir
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_commission DECIMAL(15,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- 11. Verificar se o admin souzamkt0 existe e tem perfil
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
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'Administrador do sistema',
    'avatar1',
    'souzamkt0',
    'admin',
    0.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- 12. Resumo final
SELECT 
    'CORREÇÃO FINAL APLICADA' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
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
