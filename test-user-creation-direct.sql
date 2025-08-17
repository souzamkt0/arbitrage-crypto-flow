-- Teste direto de criação de usuário
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o trigger está realmente funcionando
SELECT 
    'Verificação do trigger' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 2. Verificar se a função existe e está correta
SELECT 
    'Verificação da função' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_user_profile', 'handle_new_user')
ORDER BY routine_name;

-- 3. Verificar RLS da tabela profiles
SELECT 
    'Status RLS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Verificar políticas RLS
SELECT 
    'Políticas RLS' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Testar inserção direta na tabela profiles (simular trigger)
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
    'teste_direto@exemplo.com',
    'Teste Direto',
    'testedireto',
    'Teste de inserção direta',
    'avatar1',
    NOW(),
    NOW()
);

-- 6. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção direta' as info,
    COUNT(*) as total
FROM profiles 
WHERE email = 'teste_direto@exemplo.com';

-- 7. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura da tabela' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 8. Verificar constraints
SELECT 
    'Constraints' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 9. Testar função manualmente (se existir)
-- SELECT create_user_profile();

-- 10. Verificar logs de erro recentes
SELECT 
    'Logs recentes' as info,
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE application_name LIKE '%supabase%'
AND state = 'active'
ORDER BY query_start DESC
LIMIT 5;

-- 11. Limpar teste
DELETE FROM profiles WHERE email = 'teste_direto@exemplo.com';

-- 12. Resumo final
SELECT 
    'RESUMO DO TESTE' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger existe'
        ELSE '❌ Trigger não existe'
    END as trigger_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('create_user_profile', 'handle_new_user')
        ) THEN '✅ Função existe'
        ELSE '❌ Função não existe'
    END as function_status,
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles') = false THEN '✅ RLS desabilitado'
        ELSE '❌ RLS habilitado'
    END as rls_status;
