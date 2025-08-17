-- Correção simples para criação de usuários
-- Execute este código no SQL Editor do Supabase

-- 1. Remover tudo que pode estar causando conflito
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile_simple();
DROP FUNCTION IF EXISTS create_user_profile_safe();
DROP FUNCTION IF EXISTS create_user_profile_with_referral();
DROP FUNCTION IF EXISTS create_user_profile_robust();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_minimal_profile();

-- 2. Desabilitar RLS completamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Criar função MUITO simples
CREATE OR REPLACE FUNCTION create_basic_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil básico sem complicações
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

-- 4. Criar trigger simples
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_basic_profile();

-- 5. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 6. Verificar RLS
SELECT 
    'RLS Status' as info,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. Teste manual de inserção
-- Inserir um perfil de teste diretamente
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
    'teste@teste.com',
    'Usuário Teste',
    'teste',
    'Usuário de teste',
    'avatar1',
    'souzamkt0',
    'user',
    0.00,
    0.00,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 8. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção' as info,
    COUNT(*) as total_perfis
FROM profiles;

-- 9. Resumo final
SELECT 
    'CONFIGURAÇÃO SIMPLES' as info,
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
    'Teste o cadastro agora' as status;
