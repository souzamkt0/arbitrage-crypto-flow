-- CORREÇÃO ULTRA-AGRESSIVA DO PROBLEMA DE LOGIN
-- Vamos recriar completamente a estrutura de autenticação

-- 1. Primeiro, vamos ver se há usuários problemáticos
SELECT email, id, email_change, email_change_token_new, email_change_token_current
FROM auth.users 
WHERE email_change IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change_token_current IS NULL
LIMIT 5;

-- 2. Delete TODOS os usuários existentes (para começar limpo)
DELETE FROM auth.users WHERE email IN ('admin@clean.com', 'admin@final.com');

-- 3. Vamos forçar um reset completo dos campos problemáticos em TODOS os usuários
UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  confirmation_sent_at = COALESCE(confirmation_sent_at, NOW()),
  recovery_sent_at = COALESCE(recovery_sent_at, NOW()),
  email_change_sent_at = COALESCE(email_change_sent_at, NOW()),
  phone_change_sent_at = COALESCE(phone_change_sent_at, NOW()),
  reauthentication_sent_at = COALESCE(reauthentification_sent_at, NOW()),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE id IS NOT NULL;

-- 4. Criar um usuário admin completamente novo com TODOS os campos preenchidos
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@clean.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NOW(),
  '',
  NOW(),
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"role":"admin"}',
  true,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NOW(),
  '',
  0,
  NULL,
  '',
  NOW(),
  false,
  NULL
);

-- 5. Confirmar que o usuário foi criado corretamente
DO $$
DECLARE
    user_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'admin@clean.com';
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Falha ao criar usuário admin@clean.com';
    END IF;
    RAISE NOTICE 'Usuário admin@clean.com criado com sucesso. Total de usuários: %', user_count;
END $$;