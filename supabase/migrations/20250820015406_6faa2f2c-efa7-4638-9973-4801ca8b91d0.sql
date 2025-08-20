-- FORÇA BRUTA: Set todos os campos como string vazia
UPDATE auth.users 
SET 
    confirmation_token = '',
    email_change_token_new = '',
    email_change_token_current = '',
    recovery_token = ''
WHERE id = (SELECT id FROM auth.users WHERE email = 'souzamkt0@gmail.com');

-- Teste imediato
SELECT 
    'Teste Pós Correção' as info,
    email,
    confirmation_token,
    email_change_token_new,
    email_change_token_current,
    recovery_token
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';