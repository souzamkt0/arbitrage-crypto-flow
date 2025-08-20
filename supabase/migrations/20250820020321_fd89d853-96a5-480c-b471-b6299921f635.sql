-- CRIAR USUÁRIO DE TESTE ADICIONAL PARA GARANTIR QUE FUNCIONA
-- Usando método alternativo de criação

-- 1. Criar usuário teste com senha simples
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    email_change_token_current,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@sistema.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
);

-- 2. Criar perfil para usuário teste
INSERT INTO profiles (
    user_id,
    email,
    full_name,
    display_name,
    username,
    role,
    status,
    bio,
    profile_completed,
    email_verified
) 
SELECT 
    u.id,
    u.email,
    'Admin Sistema',
    'Admin Sistema',
    'adminsistema',
    'admin',
    'active',
    'Admin de Backup',
    true,
    true
FROM auth.users u 
WHERE u.email = 'admin@sistema.com';

-- 3. Listar ambos os admins
SELECT 
    'ADMINS DISPONÍVEIS' as info,
    u.email,
    p.display_name,
    p.role,
    CASE u.email
        WHEN 'souzamkt0@gmail.com' THEN 'Senha: admin123'
        WHEN 'admin@sistema.com' THEN 'Senha: 123456'
    END as credenciais
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email IN ('souzamkt0@gmail.com', 'admin@sistema.com')
ORDER BY u.email;