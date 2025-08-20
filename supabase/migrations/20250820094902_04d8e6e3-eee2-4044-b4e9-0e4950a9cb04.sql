-- ÚLTIMA TENTATIVA COM USUÁRIO EXTREMAMENTE SIMPLES
-- Criar usuário usando método básico que sabemos que funciona

-- Limpar usuários de teste anteriores
DELETE FROM profiles WHERE email LIKE '%test%' OR email LIKE '%simple%';
DELETE FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%simple%';

-- Criar usuário final de teste
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin@final.com',
    crypt('password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
);

-- Criar perfil simples
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    role,
    status,
    email_verified,
    profile_completed
) 
SELECT 
    id,
    'admin@final.com',
    'Admin Final',
    'admin',
    'active',
    true,
    true
FROM auth.users 
WHERE email = 'admin@final.com';

-- Status final
SELECT 
    'USUARIO FINAL CRIADO' as status,
    u.email,
    'Senha: password' as senha,
    p.role,
    'Tente fazer login agora' as instrucao
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@final.com';