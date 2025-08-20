-- CORREÇÃO ULTRA-ESPECÍFICA PARA ADMIN@CLEAN.COM
-- Verificar e corrigir especificamente este usuário

-- Ver o estado atual do usuário admin@clean.com
SELECT 
  email,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  phone_change_token,
  reauthentication_token,
  email_change,
  phone_change,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'admin@clean.com';

-- Atualização ESPECÍFICA para admin@clean.com
UPDATE auth.users SET 
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  phone_change_token = '',
  reauthentication_token = '',
  email_change = '',
  phone_change = '',
  confirmation_sent_at = NOW(),
  recovery_sent_at = NOW(),
  email_change_sent_at = NOW(),
  phone_change_sent_at = NOW(),
  reauthentication_sent_at = NOW(),
  email_confirmed_at = NOW()
WHERE email = 'admin@clean.com';

-- Verificação final
SELECT 
  'Usuário corrigido:' as status,
  email,
  LENGTH(confirmation_token) as confirmation_token_len,
  LENGTH(email_change) as email_change_len,
  LENGTH(email_change_token_new) as token_new_len,
  email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'admin@clean.com';

-- Testar se a função de autenticação funciona consultando o usuário
SELECT 'Teste de consulta auth:' as test, COUNT(*) as user_count
FROM auth.users 
WHERE email = 'admin@clean.com' 
  AND encrypted_password IS NOT NULL
  AND email_confirmed_at IS NOT NULL;