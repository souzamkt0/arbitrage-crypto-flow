-- LIMPEZA COMPLETA E RECRIAÇÃO
-- 1. Deletar completamente dados existentes
DELETE FROM profiles WHERE email = 'souzamkt0@gmail.com';
DELETE FROM auth.users WHERE email = 'souzamkt0@gmail.com';

-- 2. Criar usuário admin do zero com novo ID
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

-- 3. Criar perfil admin vinculado
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

-- 4. Teste final
SELECT 
    'ADMIN LIMPO E RECRIADO' as resultado,
    u.id,
    u.email,
    u.confirmation_token,
    u.email_change_token_new,
    u.email_change_token_current,
    p.role,
    p.display_name,
    '✅ PRONTO PARA LOGIN' as status
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';