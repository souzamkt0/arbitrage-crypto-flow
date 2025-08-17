-- Diagnosticar e corrigir erro de criação de usuário
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se há triggers conflitantes
SELECT 
    'Triggers existentes' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'profiles'
ORDER BY trigger_name;

-- 2. Verificar se há triggers na tabela auth.users
SELECT 
    'Triggers em auth.users' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 3. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura da tabela profiles' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verificar constraints da tabela profiles
SELECT 
    'Constraints da tabela profiles' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 5. Remover triggers conflitantes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_new_users ON auth.users;

-- 6. Remover funções conflitantes
DROP FUNCTION IF EXISTS create_minimal_profile();
DROP FUNCTION IF EXISTS auto_confirm_new_users();
DROP FUNCTION IF EXISTS confirm_email_on_signup();

-- 7. Criar função simples para criar perfil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil básico
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user'),
        'Novo usuário',
        'avatar1',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger simples
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 9. Verificar se o trigger foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 10. Testar criação de perfil manualmente
-- SELECT handle_new_user();

-- 11. Verificar RLS (Row Level Security)
SELECT 
    'Políticas RLS da tabela profiles' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 12. Verificar se RLS está habilitado
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 13. Desabilitar RLS temporariamente para teste
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 14. Verificar usuários recentes que falharam
SELECT 
    'Usuários recentes sem perfil' as info,
    u.id,
    u.email,
    u.created_at,
    p.user_id as profile_exists
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
AND p.user_id IS NULL
ORDER BY u.created_at DESC;
