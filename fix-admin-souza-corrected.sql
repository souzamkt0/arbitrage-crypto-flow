-- Verificar e corrigir status do admin souzamkt0 (Versão Corrigida)
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o usuário souzamkt0 existe
SELECT 
    'Verificação do Admin Souza' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        ELSE '✅ Email confirmado'
    END as status_email
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';

-- 2. Verificar perfil do admin souzamkt0 (sem referral_code)
SELECT 
    'Perfil do Admin Souza' as info,
    user_id,
    email,
    display_name,
    username,
    role,
    balance,
    total_profit,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- 3. Confirmar email do admin souzamkt0 (se não estiver confirmado)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'souzamkt0@gmail.com' 
AND email_confirmed_at IS NULL;

-- 4. Garantir que o admin souzamkt0 tenha role 'admin'
UPDATE profiles 
SET role = 'admin'
WHERE email = 'souzamkt0@gmail.com';

-- 5. Se o perfil não existir, criar um (sem referral_code)
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
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
    'admin',
    0.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.email = 'souzamkt0@gmail.com'
);

-- 6. Verificar resultado final
SELECT 
    'Status Final do Admin Souza' as info,
    u.id,
    u.email,
    u.email_confirmed_at,
    p.role,
    p.display_name,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL AND p.role = 'admin' THEN '✅ Admin Ativo'
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        WHEN p.role != 'admin' THEN '❌ Role incorreto'
        ELSE '⚠️ Status desconhecido'
    END as status_final
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';

-- 7. Verificar se o admin está na tabela partners
SELECT 
    'Admin Souza na tabela Partners' as info,
    id,
    user_id,
    email,
    display_name,
    commission_percentage,
    status,
    created_at
FROM partners 
WHERE email = 'souzamkt0@gmail.com';

-- 8. Se não estiver na tabela partners, adicionar
INSERT INTO partners (
    user_id,
    email,
    display_name,
    commission_percentage,
    status,
    created_at,
    updated_at
)
SELECT 
    p.user_id,
    p.email,
    p.display_name,
    1.00,
    'active',
    NOW(),
    NOW()
FROM profiles p
WHERE p.email = 'souzamkt0@gmail.com'
AND p.role = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM partners pt WHERE pt.email = 'souzamkt0@gmail.com'
);

-- 9. Verificar todas as configurações do admin
SELECT 
    'Configuração Completa do Admin Souza' as info,
    u.email as auth_email,
    u.email_confirmed_at as auth_confirmed,
    p.role as profile_role,
    p.display_name as profile_name,
    pt.commission_percentage as partner_commission,
    pt.status as partner_status,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL 
        AND p.role = 'admin' 
        AND pt.status = 'active' THEN '✅ Admin Completo'
        ELSE '❌ Configuração Incompleta'
    END as status_completo
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN partners pt ON u.email = pt.email
WHERE u.email = 'souzamkt0@gmail.com';

-- 10. Verificar estrutura da tabela profiles para debug
SELECT 
    'Estrutura da tabela profiles' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
