-- Criar sessão de bypass para admin souzamkt0@gmail.com

-- Primeiro verificar se o perfil existe
SELECT 
    'Perfil atual de souzamkt0' as info,
    user_id,
    email,
    role,
    display_name
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- Se não existir, criar o perfil
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
    '2441e304-9a11-412c-8d13-b2c9fc701d8f'::uuid, -- ID fixo para o admin
    'souzamkt0@gmail.com',
    'Admin Souza',
    'souzamkt0',
    'admin',
    0.00,
    0.00,
    'souzamkt0',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'souzamkt0@gmail.com'
);

-- Garantir que o role é admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'souzamkt0@gmail.com';

-- Verificar resultado final
SELECT 
    'Perfil final de souzamkt0' as info,
    user_id,
    email,
    role,
    display_name,
    is_admin(user_id) as admin_check
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';