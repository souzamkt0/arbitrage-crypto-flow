-- RECRIAÇÃO LIMPA DO ADMIN
-- Criar usuário admin com todos os tokens corretos
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

-- Criar perfil admin completo
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

-- VERIFICAÇÃO FINAL COMPLETA
SELECT 
    '🎉 ADMIN RECRIADO' as resultado,
    u.id as user_id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.confirmation_token = '' as token_confirmation_ok,
    u.email_change_token_new = '' as token_change_new_ok,
    u.email_change_token_current = '' as token_change_current_ok,
    u.recovery_token = '' as token_recovery_ok,
    p.role,
    p.display_name,
    p.username,
    is_admin_user('souzamkt0@gmail.com') as funcao_admin_ok,
    '✅ LOGIN DEVE FUNCIONAR AGORA!' as status_final
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';