-- Redefinir senha e corrigir completamente o usuário souzamkt0@gmail.com
-- Esta correção resolve todos os problemas de login

-- 1. Redefinir senha para 'admin123' (hash será gerado automaticamente)
UPDATE auth.users 
SET 
    encrypted_password = crypt('admin123', gen_salt('bf')),
    email_change = '',
    email_change_token_new = '',  
    email_change_token_current = '',
    email_change_confirm_status = 0,
    email_change_sent_at = NULL,
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW(),
    raw_app_meta_data = '{}',
    raw_user_meta_data = '{}',
    is_super_admin = false,
    role = 'authenticated',
    aud = 'authenticated'
WHERE email = 'souzamkt0@gmail.com';

-- 2. Garantir que o perfil está correto
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    role,
    status,
    balance,
    total_profit,
    referral_code,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'admin',
    'active',
    0.00,
    0.00,
    'souzamkt0',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- 3. Atualizar perfil existente se necessário
UPDATE profiles 
SET 
    role = 'admin',
    status = 'active',
    username = 'souzamkt0',
    referral_code = 'souzamkt0',
    updated_at = NOW()
WHERE email = 'souzamkt0@gmail.com';

-- 4. Verificar resultado final e mostrar credenciais
SELECT 
    'CREDENCIAIS DE LOGIN' as info,
    'souzamkt0@gmail.com' as email,
    'admin123' as senha,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL AND p.role = 'admin' THEN '✅ PRONTO PARA LOGIN'
        ELSE '❌ AINDA COM PROBLEMAS'
    END as status_final,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    p.role as perfil_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';