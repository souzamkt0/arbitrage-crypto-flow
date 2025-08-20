-- TENTAR CRIAR USUÁRIO USANDO A FUNÇÃO NATIVA DO SUPABASE
-- Se o problema é com o schema, talvez usar a função oficial resolva

-- Usar a função auth.create_user do Supabase
SELECT auth.create_user(
    'admin@simple.com',
    '123456789',
    'Admin Simple',
    true,  -- email confirmado
    '{}'::jsonb  -- metadata vazio
);

-- Criar perfil para este usuário
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    role,
    status,
    email_verified,
    profile_completed,
    created_at,
    updated_at
) 
SELECT 
    id as user_id,
    'admin@simple.com',
    'Admin Simple',
    'adminsimple',
    'admin',
    'active',
    true,
    true,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@simple.com';

-- Verificar o usuário criado
SELECT 
    'ADMIN SIMPLE CRIADO' as resultado,
    u.email,
    u.id,
    p.role,
    'Senha: 123456789' as credenciais
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@simple.com';