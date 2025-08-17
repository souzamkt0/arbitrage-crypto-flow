-- Verificar configuração do Supabase
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se estamos conectados como postgres
SELECT 
    'Conexão atual' as info,
    current_user as usuario_atual,
    current_database() as banco_atual,
    current_schema as schema_atual;

-- 2. Verificar permissões do usuário postgres
SELECT 
    'Permissões' as info,
    grantee,
    privilege_type,
    table_name
FROM information_schema.role_table_grants 
WHERE grantee = 'postgres'
AND table_name = 'profiles'
ORDER BY privilege_type;

-- 3. Verificar se a tabela profiles existe e é acessível
SELECT 
    'Acesso à tabela profiles' as info,
    table_name,
    table_type,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 4. Verificar se conseguimos fazer SELECT na tabela profiles
SELECT 
    'Teste SELECT' as info,
    COUNT(*) as total_registros
FROM profiles;

-- 5. Verificar se conseguimos fazer INSERT na tabela profiles
-- Primeiro, vamos tentar inserir um registro de teste
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    insert_success BOOLEAN := false;
BEGIN
    BEGIN
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
            'teste_insert@teste.com',
            'Teste Insert',
            'teste_insert',
            'Teste de inserção',
            'avatar1',
            'souzamkt0',
            'user',
            0.00,
            0.00,
            NOW(),
            NOW()
        );
        
        insert_success := true;
        
        -- Deletar o registro de teste
        DELETE FROM profiles WHERE user_id = test_user_id;
        
        RAISE NOTICE '✅ INSERT funcionou - registro de teste criado e removido';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ INSERT falhou: %', SQLERRM;
    END;
END $$;

-- 6. Verificar se há constraints que podem estar bloqueando
SELECT 
    'Constraints que podem bloquear' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
ORDER BY tc.constraint_type;

-- 7. Verificar se há triggers que podem estar interferindo
SELECT 
    'Triggers existentes' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    trigger_schema
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- 8. Verificar se há funções que podem estar interferindo
SELECT 
    'Funções relacionadas' as info,
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%profile%'
ORDER BY routine_name;

-- 9. Verificar logs de erro recentes (se disponível)
SELECT 
    'Logs de erro' as info,
    'Verifique os logs do Supabase Dashboard' as instrucao;

-- 10. Resumo final
SELECT 
    'DIAGNÓSTICO SUPABASE' as info,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
        ) THEN '✅ Tabela acessível'
        ELSE '❌ Tabela não acessível'
    END as acesso_tabela,
    CASE 
        WHEN current_user = 'postgres' THEN '✅ Usuário correto'
        ELSE '❌ Usuário incorreto'
    END as usuario,
    'Se tudo estiver ✅, o problema pode ser no frontend' as proximo_passo;

