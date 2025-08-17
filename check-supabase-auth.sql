-- Verificar configuração do Supabase Auth
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar configuração do Auth
SELECT 
    'Configuração Auth' as info,
    'Verifique se o email confirmation está desabilitado' as instrucao;

-- 2. Verificar se há usuários não confirmados
SELECT 
    'Usuários não confirmados' as info,
    COUNT(*) as total_nao_confirmados
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 3. Verificar usuários recentes
SELECT 
    'Usuários Recentes' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar se há problemas com metadata
SELECT 
    'Metadata dos usuários' as info,
    email,
    raw_user_meta_data,
    CASE 
        WHEN raw_user_meta_data IS NULL THEN '❌ Sem metadata'
        WHEN raw_user_meta_data = '{}' THEN '⚠️ Metadata vazio'
        ELSE '✅ Com metadata'
    END as status_metadata
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar se há usuários duplicados
SELECT 
    'Usuários duplicados' as info,
    email,
    COUNT(*) as total
FROM auth.users 
GROUP BY email
HAVING COUNT(*) > 1;

-- 6. Verificar se há perfis duplicados
SELECT 
    'Perfis duplicados' as info,
    user_id,
    COUNT(*) as total
FROM profiles 
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 7. Verificar se há emails duplicados nos perfis
SELECT 
    'Emails duplicados nos perfis' as info,
    email,
    COUNT(*) as total
FROM profiles 
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- 8. Verificar se há usernames duplicados
SELECT 
    'Usernames duplicados' as info,
    username,
    COUNT(*) as total
FROM profiles 
WHERE username IS NOT NULL
GROUP BY username
HAVING COUNT(*) > 1;

-- 9. Verificar se há problemas com constraints
SELECT 
    'Constraints da tabela profiles' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
AND tc.table_schema = 'public'
ORDER BY tc.constraint_type;

-- 10. Verificar se há problemas com índices
SELECT 
    'Índices da tabela profiles' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles'
AND schemaname = 'public';

-- 11. Verificar se há problemas com triggers
SELECT 
    'Triggers da tabela profiles' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_schema = 'public';

-- 12. Verificar se há problemas com funções
SELECT 
    'Funções relacionadas' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%profile%'
ORDER BY routine_name;

-- 13. Resumo final
SELECT 
    'DIAGNÓSTICO AUTH' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as nao_confirmados,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM profiles WHERE user_id IS NULL) as perfis_sem_user_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'souzamkt0@gmail.com'
        ) THEN '✅ Admin existe'
        ELSE '❌ Admin não existe'
    END as admin_status,
    'Verifique se há problemas de duplicação ou constraints' as proximo_passo;
