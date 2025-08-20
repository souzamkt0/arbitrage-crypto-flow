-- SOLUÇÃO DEFINITIVA: Recriar usuário admin do zero
-- 1. Salvar dados do perfil atual
CREATE TEMP TABLE temp_admin_profile AS 
SELECT * FROM profiles WHERE email = 'souzamkt0@gmail.com';

-- 2. Deletar usuário corrupto (CASCADE deleta perfil também)
DELETE FROM auth.users WHERE email = 'souzamkt0@gmail.com';

-- 3. Criar novo usuário admin limpo
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change_token_current,
    recovery_token,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    'souzamkt0@gmail.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
);

-- 4. Recriar perfil admin com role correto
INSERT INTO profiles (
    id,
    user_id,
    email,
    full_name,
    display_name,
    username,
    role,
    balance,
    total_profit,
    status,
    bio,
    avatar,
    referral_code,
    profile_completed,
    email_verified,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    u.id,
    u.email,
    'Admin Souza',
    'Admin Souza',
    'souzamkt0',
    'admin',
    0.00,
    0.00,
    'active',
    'Administrador do Sistema',
    'avatar1',
    'souzamkt0_admin',
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'souzamkt0@gmail.com';

-- 5. Verificar se tudo foi criado corretamente
SELECT 
    'USUÁRIO RECRIADO' as info,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.confirmation_token = '' as token_ok,
    u.email_change_token_new = '' as change_new_ok,
    u.email_change_token_current = '' as change_current_ok,
    p.role,
    p.display_name,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL 
        AND u.confirmation_token = ''
        AND u.email_change_token_new = ''
        AND u.email_change_token_current = ''
        AND p.role = 'admin' 
        THEN '✅ ADMIN RECRIADO COM SUCESSO'
        ELSE '❌ PROBLEMA NA RECRIAÇÃO'
    END as status_final
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';