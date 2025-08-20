-- Atualizar senha do usuário admin@final.com
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'admin@final.com';

-- Verificar resultado
SELECT 
    'CREDENCIAIS ATUALIZADAS' as status,
    email,
    'Senha: 123456' as senha_info,
    email_confirmed_at IS NOT NULL as email_ok
FROM auth.users 
WHERE email = 'admin@final.com';