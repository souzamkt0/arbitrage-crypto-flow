-- Verificar estrutura das tabelas
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura Profiles' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela profiles
SELECT 
    'Constraints Profiles' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 3. Verificar foreign keys da tabela profiles
SELECT 
    'Foreign Keys Profiles' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles';

-- 4. Verificar se há dados na tabela profiles
SELECT 
    'Dados Profiles' as info,
    COUNT(*) as total_perfis,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT email) as emails_unicos
FROM profiles;

-- 5. Verificar se há dados na tabela auth.users
SELECT 
    'Dados Auth.Users' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users;

-- 6. Verificar se há usuários sem perfil
SELECT 
    'Usuários sem perfil' as info,
    COUNT(*) as total_sem_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 7. Verificar se há perfis órfãos
SELECT 
    'Perfis órfãos' as info,
    COUNT(*) as total_orfos
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- 8. Teste de inserção direta na tabela profiles
-- Primeiro, verificar se conseguimos inserir um perfil básico
SELECT 
    'Teste de inserção' as info,
    'Tentando inserir perfil básico...' as status;

-- 9. Verificar se a tabela referrals existe
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

-- 10. Verificar estrutura da tabela referrals (se existir)
SELECT 
    'Estrutura Referrals' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'referrals'
ORDER BY ordinal_position;

-- 11. Resumo final
SELECT 
    'RESUMO ESTRUTURA' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'referrals'
        ) THEN '✅ Referrals existe'
        ELSE '❌ Referrals não existe'
    END as referrals_status,
    'Verifique se há problemas na estrutura' as proximo_passo;
