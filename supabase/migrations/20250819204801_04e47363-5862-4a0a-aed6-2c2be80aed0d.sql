-- Corrigir problema de login com campos NULL
-- Atualizar campos de email_change para evitar erros de scan

-- Primeiro, verificar se há problemas com campos NULL no auth.users
UPDATE auth.users 
SET 
  email_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  email_change_confirm_status = 0,
  email_change_sent_at = NULL
WHERE email_change IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change_token_current IS NULL;

-- Confirmar email do souzamkt0 se não estiver confirmado
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'souzamkt0@gmail.com' 
AND email_confirmed_at IS NULL;

-- Verificar se o perfil existe e está correto
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    role,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'admin',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);