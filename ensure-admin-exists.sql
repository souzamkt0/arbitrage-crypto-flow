-- Garantir que o admin souzamkt0 existe
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o admin existe na tabela auth.users
SELECT 
    'Admin na auth.users' as info,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ Admin existe'
        ELSE '❌ Admin não existe'
    END as status
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com';

-- 2. Verificar se o admin tem perfil
SELECT 
    'Admin na profiles' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    p.role,
    p.created_at,
    CASE 
        WHEN p.user_id IS NOT NULL THEN '✅ Perfil existe'
        ELSE '❌ Perfil não existe'
    END as status
FROM profiles p
WHERE p.email = 'souzamkt0@gmail.com';

-- 3. Criar perfil do admin se não existir
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
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'Administrador do sistema',
    'avatar1',
    'souzamkt0',
    'admin',
    0.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- 4. Atualizar perfil do admin se já existir
UPDATE profiles 
SET 
    username = 'souzamkt0',
    referral_code = 'souzamkt0',
    role = 'admin',
    display_name = 'Admin Souza',
    updated_at = NOW()
WHERE email = 'souzamkt0@gmail.com'
AND (username != 'souzamkt0' OR referral_code != 'souzamkt0' OR role != 'admin');

-- 5. Verificar resultado final
SELECT 
    'Resultado Final' as info,
    u.id as user_id,
    u.email,
    p.username,
    p.referral_code,
    p.role,
    p.created_at,
    CASE 
        WHEN p.user_id IS NOT NULL THEN '✅ Admin configurado'
        ELSE '❌ Admin não configurado'
    END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';

-- 6. Verificar se o código souzamkt0 pode ser encontrado
SELECT 
    'Busca por souzamkt0' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.role,
    CASE 
        WHEN p.username = 'souzamkt0' OR p.referral_code = 'souzamkt0' THEN '✅ Código encontrado'
        ELSE '❌ Código não encontrado'
    END as status
FROM profiles p
WHERE p.username = 'souzamkt0' OR p.referral_code = 'souzamkt0';

-- 7. Resumo final
SELECT 
    'ADMIN CONFIGURADO' as info,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'souzamkt0@gmail.com') as admin_users,
    (SELECT COUNT(*) FROM profiles WHERE email = 'souzamkt0@gmail.com') as admin_profiles,
    (SELECT COUNT(*) FROM profiles WHERE username = 'souzamkt0') as com_username_souzamkt0,
    (SELECT COUNT(*) FROM profiles WHERE referral_code = 'souzamkt0') as com_referral_souzamkt0,
    'Admin pronto para receber indicações' as status;


