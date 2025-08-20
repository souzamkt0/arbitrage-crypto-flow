-- CORREÇÃO FINAL DOS CAMPOS NULL
-- Garantir que TODOS os campos estão preenchidos

UPDATE auth.users 
SET 
  email_change = CASE WHEN email_change IS NULL THEN '' ELSE email_change END,
  email_change_token_new = CASE WHEN email_change_token_new IS NULL THEN '' ELSE email_change_token_new END,
  email_change_token_current = CASE WHEN email_change_token_current IS NULL THEN '' ELSE email_change_token_current END,
  phone_change = CASE WHEN phone_change IS NULL THEN '' ELSE phone_change END,
  phone_change_token = CASE WHEN phone_change_token IS NULL THEN '' ELSE phone_change_token END,
  recovery_token = CASE WHEN recovery_token IS NULL THEN '' ELSE recovery_token END,
  confirmation_token = CASE WHEN confirmation_token IS NULL THEN '' ELSE confirmation_token END,
  reauthentication_token = CASE WHEN reauthentication_token IS NULL THEN '' ELSE reauthentication_token END
WHERE email = 'admin@clean.com';

-- Verificar se tudo está correto
SELECT 
  'Correção final aplicada:' as status,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  CASE WHEN confirmation_token IS NULL THEN 'NULL' ELSE 'OK' END as confirmation_token_status,
  CASE WHEN email_change IS NULL THEN 'NULL' ELSE 'OK' END as email_change_status,
  CASE WHEN email_change_token_new IS NULL THEN 'NULL' ELSE 'OK' END as token_new_status,
  CASE WHEN email_change_token_current IS NULL THEN 'NULL' ELSE 'OK' END as token_current_status
FROM auth.users 
WHERE email = 'admin@clean.com';