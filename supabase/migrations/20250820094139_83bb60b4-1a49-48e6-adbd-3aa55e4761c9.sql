-- Atualizar senha do admin para 12345678
UPDATE auth.users 
SET 
    encrypted_password = crypt('12345678', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@lovable.app';

-- Verificar o resultado
SELECT 
    'ADMIN ATUALIZADO' as status,
    u.email,
    'Senha: 12345678' as nova_senha,
    p.role,
    p.display_name
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@lovable.app';