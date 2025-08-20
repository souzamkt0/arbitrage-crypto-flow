-- CORREÇÃO ESPECÍFICA DOS CAMPOS AINDA NULL
-- Forçar todos os campos problemáticos para string vazia

UPDATE auth.users 
SET 
  email_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  phone_change = '',
  phone_change_token = '',
  recovery_token = '',
  confirmation_token = '',
  reauthentication_token = ''
WHERE email = 'admin@clean.com'
  AND (
    email_change IS NULL OR
    email_change_token_new IS NULL OR
    email_change_token_current IS NULL OR
    phone_change IS NULL OR
    phone_change_token IS NULL OR
    recovery_token IS NULL OR
    confirmation_token IS NULL OR
    reauthentication_token IS NULL
  );

-- Verificação final
SELECT 
  'FINAL CHECK:' as status,
  email,
  COALESCE(email_change, 'NULL-FIELD') as email_change_check,
  COALESCE(email_change_token_new, 'NULL-FIELD') as token_new_check,
  COALESCE(email_change_token_current, 'NULL-FIELD') as token_current_check,
  'Usuário pronto para teste' as message
FROM auth.users 
WHERE email = 'admin@clean.com';