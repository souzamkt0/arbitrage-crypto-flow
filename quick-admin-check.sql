-- Verificação Rápida do Admin Souza
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o usuário existe e está confirmado
SELECT 
    'Status do Usuário' as info,
    email,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        ELSE '✅ Email confirmado'
    END as status_email,
    created_at
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';

-- 2. Verificar se o perfil existe e tem role admin
SELECT 
    'Status do Perfil' as info,
    email,
    role,
    display_name,
    CASE 
        WHEN role = 'admin' THEN '✅ Admin'
        ELSE '❌ Não é admin'
    END as status_role
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- 3. Verificar se está na tabela partners
SELECT 
    'Status Partner' as info,
    email,
    commission_percentage,
    status,
    CASE 
        WHEN status = 'active' THEN '✅ Ativo'
        ELSE '❌ Inativo'
    END as status_partner
FROM partners 
WHERE email = 'souzamkt0@gmail.com';

-- 4. Resumo completo
SELECT 
    'RESUMO COMPLETO' as info,
    u.email,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅'
        ELSE '❌'
    END as email_confirmado,
    CASE 
        WHEN p.role = 'admin' THEN '✅'
        ELSE '❌'
    END as eh_admin,
    CASE 
        WHEN pt.status = 'active' THEN '✅'
        ELSE '❌'
    END as eh_partner,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL 
        AND p.role = 'admin' 
        AND pt.status = 'active' THEN '✅ ADMIN COMPLETO'
        ELSE '❌ PROBLEMA DETECTADO'
    END as status_final
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN partners pt ON u.email = pt.email
WHERE u.email = 'souzamkt0@gmail.com';
