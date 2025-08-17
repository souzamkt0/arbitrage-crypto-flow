-- Debug do trigger de referral
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o trigger está ativo
SELECT 
    'Status do Trigger' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ Trigger ativo'
        ELSE '❌ Trigger inativo'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT 
    'Status da Função' as info,
    routine_name,
    routine_type,
    data_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ Função existe'
        ELSE '❌ Função não existe'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile_with_referral';

-- 3. Verificar logs recentes do trigger
SELECT 
    'Logs Recentes' as info,
    'Verifique os logs do console para mensagens do trigger' as instrucao;

-- 4. Verificar usuários recentes
SELECT 
    'Usuários Recentes' as info,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data,
    CASE 
        WHEN p.user_id IS NOT NULL THEN '✅ Tem perfil'
        ELSE '❌ Sem perfil'
    END as tem_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Verificar perfis recentes
SELECT 
    'Perfis Recentes' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    p.whatsapp,
    p.city,
    p.state,
    p.created_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Verificar referrals recentes
SELECT 
    'Referrals Recentes' as info,
    r.id,
    r.referrer_id,
    r.referred_id,
    r.referral_code,
    r.commission_rate,
    r.total_commission,
    r.status,
    r.created_at,
    referrer.email as referrer_email,
    referred.email as referred_email
FROM referrals r
LEFT JOIN profiles referrer ON r.referrer_id = referrer.user_id
LEFT JOIN profiles referred ON r.referred_id = referred.user_id
ORDER BY r.created_at DESC
LIMIT 10;

-- 7. Teste manual de inserção de referral
-- Primeiro, pegar um usuário que tem perfil mas não tem referral
SELECT 
    'Usuários sem referral' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by
FROM profiles p
WHERE p.referred_by IS NULL 
AND p.email != 'souzamkt0@gmail.com'
ORDER BY p.created_at DESC
LIMIT 5;

-- 8. Verificar se o admin souzamkt0 tem perfil
SELECT 
    'Admin Souza' as info,
    u.id,
    u.email,
    u.created_at,
    p.username,
    p.referral_code,
    p.referred_by,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';

-- 9. Teste de busca por código de indicação
SELECT 
    'Busca por souzamkt0' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by
FROM profiles p
WHERE p.username = 'souzamkt0' 
   OR p.referral_code = 'souzamkt0'
   OR p.email = 'souzamkt0@gmail.com';

-- 10. Resumo para debug
SELECT 
    'DEBUG COMPLETO' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    (SELECT COUNT(*) FROM profiles WHERE referral_code IS NOT NULL) as com_referral_code,
    (SELECT COUNT(*) FROM profiles WHERE referred_by IS NOT NULL) as com_referred_by,
    'Abra o console (F12) e verifique os logs' as proximo_passo;
