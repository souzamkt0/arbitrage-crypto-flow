-- Verificar dados na tabela referrals
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela referrals
SELECT 
    'Estrutura da tabela referrals' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'referrals'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela referrals existe e tem dados
SELECT 
    'Dados na tabela referrals' as info,
    COUNT(*) as total_referrals
FROM referrals;

-- 3. Listar todos os referrals existentes
SELECT 
    'Referrals existentes' as info,
    r.id,
    r.referral_code,
    r.commission_rate,
    r.total_commission,
    r.status,
    r.created_at,
    referrer.email as referrer_email,
    referrer.username as referrer_username,
    referred.email as referred_email,
    referred.username as referred_username
FROM referrals r
JOIN profiles referrer ON r.referrer_id = referrer.user_id
JOIN profiles referred ON r.referred_id = referred.user_id
ORDER BY r.created_at DESC;

-- 4. Verificar se há referrals para o admin souzamkt0
SELECT 
    'Referrals do Admin Souza' as info,
    r.id,
    r.referral_code,
    r.commission_rate,
    r.total_commission,
    r.status,
    r.created_at,
    referred.email as referred_email,
    referred.username as referred_username,
    referred.display_name as referred_name
FROM referrals r
JOIN profiles referrer ON r.referrer_id = referrer.user_id
JOIN profiles referred ON r.referred_id = referred.user_id
WHERE referrer.email = 'souzamkt0@gmail.com'
ORDER BY r.created_at DESC;

-- 5. Verificar perfis com referral_code
SELECT 
    'Perfis com referral_code' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    p.created_at
FROM profiles p
WHERE p.referral_code IS NOT NULL
ORDER BY p.created_at DESC;

-- 6. Verificar perfis com referred_by
SELECT 
    'Perfis com referred_by' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    referrer.email as referrer_email,
    p.created_at
FROM profiles p
LEFT JOIN profiles referrer ON p.referred_by = referrer.user_id
WHERE p.referred_by IS NOT NULL
ORDER BY p.created_at DESC;

-- 7. Verificar se há usuários sem referral_code
SELECT 
    'Usuários sem referral_code' as info,
    COUNT(*) as total_sem_referral_code
FROM profiles 
WHERE referral_code IS NULL;

-- 8. Verificar se há usuários sem referred_by
SELECT 
    'Usuários sem referred_by' as info,
    COUNT(*) as total_sem_referred_by
FROM profiles 
WHERE referred_by IS NULL;

-- 9. Teste de busca por código de indicação
SELECT 
    'Teste de busca por souzamkt0' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by
FROM profiles p
WHERE p.username = 'souzamkt0' OR p.referral_code = 'souzamkt0';

-- 10. Resumo final
SELECT 
    'RESUMO FINAL' as info,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM profiles WHERE referral_code IS NOT NULL) as com_referral_code,
    (SELECT COUNT(*) FROM profiles WHERE referred_by IS NOT NULL) as com_referred_by,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    (SELECT COUNT(*) FROM referrals WHERE status = 'active') as referrals_ativos,
    'Verifique se os dados estão sendo salvos corretamente' as status;
