-- SOLUÇÃO ALTERNATIVA: Resetar senha do usuário existente via função nativa
-- Isso pode limpar os tokens problemáticos

-- Primeiro, vamos tentar uma abordagem diferente
-- Confirmar o email novamente pode limpar os tokens
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmation_sent_at = NOW()
WHERE email = 'souzamkt0@gmail.com';

-- Verificar se isso limpou os problemas
SELECT 
    'Status Após Reset' as info,
    email,
    confirmation_token IS NULL as conf_null,
    email_change_token_new IS NULL as change_new_null,
    email_change_token_current IS NULL as change_current_null,
    email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';