-- Forçar atualização direta para o usuário específico
UPDATE auth.users 
SET 
    email_change_token_new = '',
    email_change_token_current = '',
    recovery_token = ''
WHERE email = 'souzamkt0@gmail.com';

-- Verificar se funcionou
SELECT 
    'Status Final Tokens' as info,
    email,
    confirmation_token,
    email_change_token_new,
    email_change_token_current,
    recovery_token,
    CASE 
        WHEN confirmation_token IS NOT NULL 
        AND email_change_token_new IS NOT NULL 
        AND email_change_token_current IS NOT NULL 
        AND recovery_token IS NOT NULL 
        THEN '✅ TODOS OS TOKENS OK'
        ELSE '❌ AINDA HÁ NULL'
    END as status
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';