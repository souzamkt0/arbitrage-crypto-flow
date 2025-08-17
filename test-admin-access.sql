-- Teste de Acesso do Admin Souza
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o usuário existe
SELECT 
    'Usuário Existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resposta
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';

-- 2. Verificar se o email está confirmado
SELECT 
    'Email Confirmado?' as pergunta,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resposta
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';

-- 3. Verificar se o perfil existe
SELECT 
    'Perfil Existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resposta
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- 4. Verificar se está na tabela partners
SELECT 
    'É Partner?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resposta
FROM partners 
WHERE email = 'souzamkt0@gmail.com';

-- 5. Teste da função is_admin_user
SELECT 
    'Função is_admin_user funciona?' as pergunta,
    CASE 
        WHEN is_admin_user('souzamkt0@gmail.com') THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resposta;

-- 6. Resumo final
SELECT 
    'RESUMO FINAL' as info,
    'souzamkt0@gmail.com' as email,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅'
        ELSE '❌'
    END as email_confirmado,
    CASE 
        WHEN p.user_id IS NOT NULL THEN '✅'
        ELSE '❌'
    END as perfil_existe,
    CASE 
        WHEN pt.status = 'active' THEN '✅'
        ELSE '❌'
    END as eh_partner,
    CASE 
        WHEN is_admin_user('souzamkt0@gmail.com') THEN '✅'
        ELSE '❌'
    END as funcao_admin,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL 
        AND p.user_id IS NOT NULL 
        AND pt.status = 'active' THEN '✅ ADMIN FUNCIONANDO'
        ELSE '❌ PROBLEMA DETECTADO'
    END as status_final
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN partners pt ON u.email = pt.email
WHERE u.email = 'souzamkt0@gmail.com';

