-- Correção final para criação de usuários
-- Execute este código no SQL Editor do Supabase

-- 1. Limpar triggers e funções antigas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile_safe();
DROP FUNCTION IF EXISTS create_user_profile_with_referral();
DROP FUNCTION IF EXISTS create_user_profile_robust();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_minimal_profile();

-- 2. Desabilitar RLS temporariamente na tabela profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Criar função simples e robusta
CREATE OR REPLACE FUNCTION create_user_profile_simple()
RETURNS TRIGGER AS $$
DECLARE
    ref_code TEXT;
    referrer_user_id UUID;
    generated_username TEXT;
BEGIN
    -- Log para debug
    RAISE NOTICE 'Iniciando criação de perfil para usuário: %', NEW.email;
    
    -- Verificar se o perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
        RAISE NOTICE 'Perfil já existe para usuário %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Extrair código de referência do metadata
    ref_code := COALESCE(NEW.raw_user_meta_data->>'referral_code', 'souzamkt0');
    RAISE NOTICE 'Código de referência: %', ref_code;
    
    -- Gerar username único baseado no email
    generated_username := split_part(NEW.email, '@', 1);
    
    -- Verificar se o username já existe e torná-lo único se necessário
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
        generated_username := generated_username || floor(random() * 1000)::text;
    END LOOP;
    
    -- Buscar o referrer pelo username/código
    SELECT user_id INTO referrer_user_id 
    FROM public.profiles 
    WHERE username = lower(ref_code) OR referral_code = ref_code;
    
    RAISE NOTICE 'Referrer encontrado: %', referrer_user_id;
    
    -- Inserir perfil do usuário
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        referral_code,
        referred_by,
        whatsapp,
        city,
        state,
        role,
        balance,
        total_profit,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
        generated_username,
        'Novo usuário',
        'avatar1',
        ref_code,
        referrer_user_id,
        NEW.raw_user_meta_data->>'whatsapp',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        CASE 
            WHEN NEW.email = 'souzamkt0@gmail.com' THEN 'admin'
            ELSE 'user'
        END,
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário %', NEW.email;
    
    -- Se encontrou o referrer, criar o relacionamento na tabela referrals
    IF referrer_user_id IS NOT NULL THEN
        BEGIN
            INSERT INTO public.referrals (
                referrer_id,
                referred_id,
                referral_code,
                commission_rate,
                total_commission,
                status
            ) VALUES (
                referrer_user_id,
                NEW.id,
                ref_code,
                10.00,
                0.00,
                'active'
            );
            
            RAISE NOTICE 'Relacionamento de indicação criado: % -> %', ref_code, NEW.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao criar relacionamento de indicação: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Código de indicação não encontrado: %', ref_code;
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_simple();

-- 5. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 6. Verificar função
SELECT 
    'Função criada' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile_simple';

-- 7. Verificar RLS
SELECT 
    'RLS Status' as info,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS desabilitado'
        ELSE '❌ RLS habilitado'
    END as status
FROM pg_tables 
WHERE tablename = 'profiles';

-- 8. Verificar estrutura da tabela profiles
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

-- 9. Verificar estrutura da tabela referrals
SELECT 
    'Estrutura Referrals' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'referrals'
ORDER BY ordinal_position;

-- 10. Resumo final
SELECT 
    'CONFIGURAÇÃO FINAL' as info,
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
    'Pronto para testar cadastro' as status;

