-- SIMPLIFICADO: Corrigir apenas os tokens que existem e estão NULL
UPDATE auth.users 
SET 
    confirmation_token = '',
    email_change_token_new = '',
    email_change_token_current = ''
WHERE email = 'souzamkt0@gmail.com' 
AND (
    confirmation_token IS NULL 
    OR email_change_token_new IS NULL 
    OR email_change_token_current IS NULL
);

-- Verificar correção
SELECT 
    'Tokens Corrigidos' as info,
    email,
    LENGTH(COALESCE(confirmation_token, '')) as token_len,
    email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';