-- Corrigir definitivamente os campos NULL problemáticos na tabela auth.users
-- que estão causando o erro "converting NULL to string is unsupported"

-- Atualizar todos os campos de email_change que estão NULL para string vazia
UPDATE auth.users 
SET 
  email_change = CASE WHEN email_change IS NULL THEN '' ELSE email_change END,
  email_change_token_new = CASE WHEN email_change_token_new IS NULL THEN '' ELSE email_change_token_new END,
  email_change_token_current = CASE WHEN email_change_token_current IS NULL THEN '' ELSE email_change_token_current END
WHERE 
  email_change IS NULL 
  OR email_change_token_new IS NULL 
  OR email_change_token_current IS NULL;

-- Definir defaults apropriados para evitar futuros problemas
ALTER TABLE auth.users 
ALTER COLUMN email_change SET DEFAULT '',
ALTER COLUMN email_change_token_new SET DEFAULT '',
ALTER COLUMN email_change_token_current SET DEFAULT '';

-- Verificar o resultado da correção
SELECT 
  email,
  CASE WHEN email_change IS NULL THEN 'NULL' ELSE 'NOT NULL' END as email_change_status,
  CASE WHEN email_change_token_new IS NULL THEN 'NULL' ELSE 'NOT NULL' END as token_new_status,
  CASE WHEN email_change_token_current IS NULL THEN 'NULL' ELSE 'NOT NULL' END as token_current_status
FROM auth.users 
WHERE email = 'admin@clean.com';