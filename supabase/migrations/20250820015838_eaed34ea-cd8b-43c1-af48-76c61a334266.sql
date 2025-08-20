-- CRIAR ADMIN FINAL COM TABELA LIMPA
-- 1. Limpar usuários existentes
DELETE FROM auth.users WHERE email IN ('souzamkt0@gmail.com', 'admin@test.com');

-- 2. Criar usuário admin limpo
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

-- 3. Criar perfil admin na tabela nova
INSERT INTO profiles (
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
    email_verified
) 
SELECT 
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
    true
FROM auth.users u 
WHERE u.email = 'souzamkt0@gmail.com';

-- 4. VERIFICAÇÃO FINAL DEFINITIVA
SELECT 
    '🎉 ADMIN CRIADO COM SUCESSO' as resultado,
    u.id as user_id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.confirmation_token as token_confirmation,
    u.email_change_token_new as token_change_new,
    u.email_change_token_current as token_change_current,
    p.role,
    p.display_name,
    p.username,
    is_admin_user('souzamkt0@gmail.com') as funcao_admin,
    '✅ PODE FAZER LOGIN: souzamkt0@gmail.com / admin123' as instrucoes
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';