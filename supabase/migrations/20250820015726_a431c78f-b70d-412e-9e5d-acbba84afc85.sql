-- TESTE COM USUÁRIO NOVO PARA VERIFICAR SE O SISTEMA FUNCIONA
-- Criar admin teste para confirmar que o problema foi resolvido
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
    'admin@test.com',
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

-- Criar perfil admin teste
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
    'Admin Teste',
    'Admin Teste',
    'admintest',
    'admin',
    0.00,
    0.00,
    'active',
    'Administrador Teste',
    'avatar1',
    'admintest',
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'admin@test.com';

-- Verificar se funcionou
SELECT 
    'TESTE: ADMIN CRIADO' as info,
    u.email,
    u.confirmation_token,
    u.email_change_token_new,
    u.email_change_token_current,
    p.role,
    '✅ TESTE ESTE LOGIN PRIMEIRO' as instrucao
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@test.com';