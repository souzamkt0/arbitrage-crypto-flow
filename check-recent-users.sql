-- Verificar usuários recentes e status de cadastro
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar usuários mais recentes no auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Não confirmado'
        ELSE '✅ Confirmado'
    END as status_email,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar perfis mais recentes
SELECT 
    user_id,
    email,
    display_name,
    username,
    role,
    balance,
    total_profit,
    referral_code,
    referred_by,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Verificar se há usuários sem perfil
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created,
    p.user_id as profile_exists,
    CASE 
        WHEN p.user_id IS NULL THEN '❌ Sem perfil'
        ELSE '✅ Com perfil'
    END as status_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC 
LIMIT 15;

-- 4. Contar usuários por status
SELECT 
    'Resumo Geral' as info,
    COUNT(*) as total_usuarios_auth,
    COUNT(p.user_id) as total_com_perfil,
    COUNT(*) - COUNT(p.user_id) as sem_perfil,
    COUNT(u.email_confirmed_at) as emails_confirmados,
    COUNT(*) - COUNT(u.email_confirmed_at) as emails_nao_confirmados
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id;

-- 5. Verificar usuários criados hoje
SELECT 
    'Usuários de Hoje' as info,
    COUNT(*) as total_hoje,
    COUNT(email_confirmed_at) as confirmados_hoje,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados_hoje
FROM auth.users 
WHERE DATE(created_at) = CURRENT_DATE;

-- 6. Verificar perfis criados hoje
SELECT 
    'Perfis de Hoje' as info,
    COUNT(*) as total_perfis_hoje,
    COUNT(display_name) as com_nome,
    COUNT(*) - COUNT(display_name) as sem_nome
FROM profiles 
WHERE DATE(created_at) = CURRENT_DATE;

-- 7. Verificar trigger de criação de perfil
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'profiles';

-- 8. Testar função de criação de perfil mínimo
-- SELECT create_minimal_profile();

-- 9. Verificar configurações de RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';
