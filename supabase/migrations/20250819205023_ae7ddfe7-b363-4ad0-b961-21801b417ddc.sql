
-- Corrigir problema específico de login para souzamkt0@gmail.com
-- O erro indica problema com campo email_change sendo NULL

-- 1. Primeiro, vamos verificar o status atual do usuário
SELECT 
    id,
    email,
    email_confirmed_at,
    email_change,
    email_change_token_new,
    email_change_token_current,
    email_change_confirm_status,
    created_at
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';

-- 2. Corrigir campos NULL que estão causando o erro de scan
UPDATE auth.users 
SET 
    email_change = '',
    email_change_token_new = '',
    email_change_token_current = '',
    email_change_confirm_status = 0,
    email_change_sent_at = NULL,
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'souzamkt0@gmail.com';

-- 3. Verificar se o perfil existe e está correto
SELECT 
    user_id,
    email,
    username,
    role,
    status
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- 4. Se não existe perfil, criar um
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    role,
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'admin',
    'active',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- 5. Garantir que o usuário tenha role admin
UPDATE profiles 
SET 
    role = 'admin',
    status = 'active',
    updated_at = NOW()
WHERE email = 'souzamkt0@gmail.com';

-- 6. Verificar resultado final
SELECT 
    'VERIFICAÇÃO FINAL' as info,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.email_change,
    p.role,
    p.status,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL AND p.role = 'admin' THEN '✅ PRONTO PARA LOGIN'
        ELSE '❌ AINDA COM PROBLEMAS'
    END as status_final
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';
