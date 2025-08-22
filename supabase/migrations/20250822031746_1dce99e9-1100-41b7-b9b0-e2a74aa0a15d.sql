-- Garantir que admin@clean.com existe na tabela profiles
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    role,
    balance,
    total_profit,
    referral_code,
    created_at,
    updated_at
)
SELECT 
    '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid,
    'admin@clean.com',
    'Administrador',
    'admin',
    'admin',
    0.00,
    0.00,
    'admin',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'admin@clean.com'
);

-- Garantir que o role seja admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@clean.com';

-- Testar a função is_admin para admin@clean.com
SELECT 
    'Teste final admin@clean.com' as info,
    user_id,
    email,
    role,
    display_name,
    is_admin(user_id) as admin_check
FROM profiles 
WHERE email = 'admin@clean.com';