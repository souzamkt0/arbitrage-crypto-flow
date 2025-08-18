-- Teste manual de criação de referral
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o admin souzamkt0 existe e tem perfil
SELECT 
    'Verificação Admin' as info,
    u.id as user_id,
    u.email,
    p.username,
    p.referral_code,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';

-- 2. Verificar usuários que podem ser indicados
SELECT 
    'Usuários para indicar' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    p.created_at
FROM profiles p
WHERE p.email != 'souzamkt0@gmail.com'
AND p.referred_by IS NULL
ORDER BY p.created_at DESC
LIMIT 5;

-- 3. Criar referral manualmente para um usuário existente
-- Primeiro, pegar o ID do admin souzamkt0
WITH admin_user AS (
    SELECT p.user_id, p.username
    FROM profiles p
    WHERE p.email = 'souzamkt0@gmail.com'
    LIMIT 1
),
user_to_refer AS (
    SELECT p.user_id, p.email, p.username
    FROM profiles p
    WHERE p.email != 'souzamkt0@gmail.com'
    AND p.referred_by IS NULL
    ORDER BY p.created_at DESC
    LIMIT 1
)
SELECT 
    'Dados para criar referral' as info,
    admin.user_id as referrer_id,
    admin.username as referrer_username,
    user_ref.user_id as referred_id,
    user_ref.email as referred_email,
    user_ref.username as referred_username
FROM admin_user admin
CROSS JOIN user_to_refer user_ref;

-- 4. Inserir referral manualmente (descomente se necessário)
/*
WITH admin_user AS (
    SELECT p.user_id
    FROM profiles p
    WHERE p.email = 'souzamkt0@gmail.com'
    LIMIT 1
),
user_to_refer AS (
    SELECT p.user_id
    FROM profiles p
    WHERE p.email != 'souzamkt0@gmail.com'
    AND p.referred_by IS NULL
    ORDER BY p.created_at DESC
    LIMIT 1
)
INSERT INTO referrals (
    referrer_id,
    referred_id,
    referral_code,
    commission_rate,
    total_commission,
    status
)
SELECT 
    admin.user_id,
    user_ref.user_id,
    'souzamkt0',
    10.00,
    0.00,
    'active'
FROM admin_user admin
CROSS JOIN user_to_refer user_ref
WHERE NOT EXISTS (
    SELECT 1 FROM referrals r 
    WHERE r.referrer_id = admin.user_id 
    AND r.referred_id = user_ref.user_id
);
*/

-- 5. Atualizar perfil do usuário indicado (descomente se necessário)
/*
WITH admin_user AS (
    SELECT p.user_id
    FROM profiles p
    WHERE p.email = 'souzamkt0@gmail.com'
    LIMIT 1
),
user_to_refer AS (
    SELECT p.user_id
    FROM profiles p
    WHERE p.email != 'souzamkt0@gmail.com'
    AND p.referred_by IS NULL
    ORDER BY p.created_at DESC
    LIMIT 1
)
UPDATE profiles 
SET 
    referral_code = 'souzamkt0',
    referred_by = admin.user_id
FROM admin_user admin
WHERE profiles.user_id = (SELECT user_id FROM user_to_refer)
AND profiles.referred_by IS NULL;
*/

-- 6. Verificar resultado após inserção manual
SELECT 
    'Resultado após inserção' as info,
    r.id,
    r.referral_code,
    r.commission_rate,
    r.status,
    referrer.email as referrer_email,
    referred.email as referred_email,
    r.created_at
FROM referrals r
JOIN profiles referrer ON r.referrer_id = referrer.user_id
JOIN profiles referred ON r.referred_id = referred.user_id
ORDER BY r.created_at DESC
LIMIT 5;

-- 7. Verificar perfis atualizados
SELECT 
    'Perfis com referred_by' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    referrer.email as referrer_email
FROM profiles p
LEFT JOIN profiles referrer ON p.referred_by = referrer.user_id
WHERE p.referred_by IS NOT NULL
ORDER BY p.created_at DESC;

-- 8. Resumo final
SELECT 
    'TESTE MANUAL' as info,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    (SELECT COUNT(*) FROM profiles WHERE referred_by IS NOT NULL) as perfis_com_referral,
    'Se os números aumentaram, o sistema está funcionando' as status;


