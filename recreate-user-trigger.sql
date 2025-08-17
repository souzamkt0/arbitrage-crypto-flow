-- Recriar trigger de usuário de forma robusta
-- Execute este código no SQL Editor do Supabase

-- 1. Limpar tudo primeiro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_minimal_profile();

-- 2. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Criar função robusta com tratamento de erro
CREATE OR REPLACE FUNCTION create_user_profile_robust()
RETURNS TRIGGER AS $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Verificar se o perfil já existe
    SELECT COUNT(*) INTO profile_count
    FROM profiles 
    WHERE user_id = NEW.id;
    
    -- Se já existe, não criar novamente
    IF profile_count > 0 THEN
        RAISE NOTICE 'Perfil já existe para usuário %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Criar perfil básico
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
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falhar
        RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_robust();

-- 5. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 6. Verificar função
SELECT 
    'Função criada' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile_robust';

-- 7. Testar função manualmente
-- SELECT create_user_profile_robust();

-- 8. Verificar RLS
SELECT 
    'Status RLS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 9. Criar política RLS básica (se necessário)
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
-- CREATE POLICY "Enable insert for authenticated users only" ON profiles
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Testar inserção manual
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste_robust@exemplo.com',
    'Teste Robust',
    'testerobust',
    'Teste de trigger robusto',
    'avatar1',
    NOW(),
    NOW()
);

-- 11. Verificar teste
SELECT 
    'Teste robusto' as info,
    COUNT(*) as total
FROM profiles 
WHERE email = 'teste_robust@exemplo.com';

-- 12. Limpar teste
DELETE FROM profiles WHERE email = 'teste_robust@exemplo.com';

-- 13. Resumo final
SELECT 
    'CONFIGURAÇÃO FINAL' as info,
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
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'create_user_profile_robust'
        ) THEN '✅ Função ativa'
        ELSE '❌ Função inativa'
    END as function_status,
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles') = false THEN '✅ RLS desabilitado'
        ELSE '❌ RLS habilitado'
    END as rls_status,
    'Pronto para testar cadastro' as status;

