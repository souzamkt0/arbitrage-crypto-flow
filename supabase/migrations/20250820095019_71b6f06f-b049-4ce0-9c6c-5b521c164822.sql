-- LIMPEZA E CONFIGURAÇÃO FINAL
-- Há um usuário criado mas com perfis inconsistentes

-- 1. Limpar perfil órfão
DELETE FROM profiles WHERE user_id IS NULL;

-- 2. Atualizar senha do usuário existente para algo que sabemos que funciona
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'admin@test.com';

-- 3. Verificar se há apenas um perfil válido
UPDATE profiles 
SET 
    display_name = 'Admin Test',
    username = 'admin',
    role = 'admin',
    status = 'active',
    email_verified = true,
    profile_completed = true
WHERE user_id = 'a0000000-0000-0000-0000-000000000001';

-- 4. Verificação final completa
SELECT 
    'TESTE FINAL' as resultado,
    u.email,
    u.id as user_id,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    p.user_id as profile_user_id,
    p.role,
    p.display_name,
    'Credenciais: admin@test.com / 123456' as login_info
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@test.com';