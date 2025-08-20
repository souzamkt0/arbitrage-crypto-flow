-- CORREÇÃO RADICAL DOS CAMPOS NULL EM AUTH.USERS
-- Este é o problema raiz que está causando "Database error querying schema"

-- Primeiro, ver exatamente quais campos estão NULL
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN confirmation_token IS NULL THEN 1 END) as null_confirmation_token,
  COUNT(CASE WHEN recovery_token IS NULL THEN 1 END) as null_recovery_token,
  COUNT(CASE WHEN email_change_token_new IS NULL THEN 1 END) as null_email_change_token_new,
  COUNT(CASE WHEN email_change_token_current IS NULL THEN 1 END) as null_email_change_token_current,
  COUNT(CASE WHEN phone_change_token IS NULL THEN 1 END) as null_phone_change_token,
  COUNT(CASE WHEN reauthentication_token IS NULL THEN 1 END) as null_reauthentication_token,
  COUNT(CASE WHEN email_change IS NULL THEN 1 END) as null_email_change,
  COUNT(CASE WHEN phone_change IS NULL THEN 1 END) as null_phone_change
FROM auth.users;

-- Forçar a correção de TODOS os campos NULL em TODAS as linhas
UPDATE auth.users SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  -- Garantir que datas também não sejam NULL
  confirmation_sent_at = COALESCE(confirmation_sent_at, NOW()),
  recovery_sent_at = COALESCE(recovery_sent_at, NOW()),
  email_change_sent_at = COALESCE(email_change_sent_at, NOW()),
  phone_change_sent_at = COALESCE(phone_change_sent_at, NOW()),
  reauthentication_sent_at = COALESCE(reauthentication_sent_at, NOW()),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE id IS NOT NULL;

-- Verificar se ainda há campos NULL
SELECT 
  'Campos NULL após correção:' as status,
  COUNT(CASE WHEN confirmation_token IS NULL THEN 1 END) as null_confirmation_token,
  COUNT(CASE WHEN email_change_token_new IS NULL THEN 1 END) as null_email_change_token_new,
  COUNT(CASE WHEN email_change IS NULL THEN 1 END) as null_email_change
FROM auth.users;

-- Garantir que o usuário admin@clean.com existe e está OK
SELECT 
  'Status do admin:' as info,
  email, 
  email_confirmed_at IS NOT NULL as email_confirmed,
  confirmation_token = '' as token_empty,
  email_change = '' as email_change_empty
FROM auth.users 
WHERE email = 'admin@clean.com';