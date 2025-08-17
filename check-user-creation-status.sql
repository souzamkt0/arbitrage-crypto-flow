-- Verificar status da criação de usuários
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar usuários criados hoje
SELECT 
    'Usuários criados hoje' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users 
WHERE DATE(created_at) = CURRENT_DATE;

-- 2. Listar usuários recentes
SELECT 
    'Usuários recentes' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Não confirmado'
        ELSE '✅ Confirmado'
    END as status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Verificar perfis criados hoje
SELECT 
    'Perfis criados hoje' as info,
    COUNT(*) as total_perfis,
    COUNT(display_name) as com_nome,
    COUNT(*) - COUNT(display_name) as sem_nome
FROM profiles 
WHERE DATE(created_at) = CURRENT_DATE;

-- 4. Listar perfis recentes
SELECT 
    'Perfis recentes' as info,
    user_id,
    email,
    display_name,
    username,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Verificar usuários sem perfil
SELECT 
    'Usuários sem perfil' as info,
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.user_id IS NULL THEN '❌ Sem perfil'
        ELSE '✅ Com perfil'
    END as status_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
ORDER BY u.created_at DESC;

-- 6. Verificar trigger de criação de perfil
SELECT 
    'Status do trigger' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 7. Verificar função de criação de perfil
SELECT 
    'Status da função' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_user_profile', 'handle_new_user')
ORDER BY routine_name;

-- 8. Testar criação manual de perfil
-- INSERT INTO profiles (
--     user_id,
--     email,
--     display_name,
--     username,
--     bio,
--     avatar,
--     created_at,
--     updated_at
-- ) VALUES (
--     gen_random_uuid(),
--     'teste3@exemplo.com',
--     'Teste 3',
--     'teste3',
--     'Teste manual',
--     'avatar1',
--     NOW(),
--     NOW()
-- );

-- 9. Verificar se o teste funcionou
-- SELECT 
--     'Teste manual' as info,
--     COUNT(*) as total
-- FROM profiles 
-- WHERE email = 'teste3@exemplo.com';

-- 10. Limpar teste
-- DELETE FROM profiles WHERE email = 'teste3@exemplo.com';

-- 11. Resumo final
SELECT 
    'RESUMO FINAL' as info,
    (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) = CURRENT_DATE) as usuarios_hoje,
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE) as perfis_hoje,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as emails_nao_confirmados,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger ativo'
        ELSE '❌ Trigger inativo'
    END as status_trigger;
