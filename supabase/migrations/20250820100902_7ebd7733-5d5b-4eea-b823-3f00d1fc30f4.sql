-- CORREÇÃO SIMPLES E DIRETA DO PROBLEMA DE LOGIN
-- Vamos criar um usuário admin limpo sem complicações

-- 1. Limpar usuários existentes problemáticos
DELETE FROM auth.users WHERE email IN ('admin@clean.com', 'admin@final.com');

-- 2. Atualizar TODOS os usuários existentes para não terem NULLs problemáticos
UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, '')
WHERE id IS NOT NULL;

-- 3. Criar usuário admin simples com campos mínimos necessários
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  phone_change_token,
  reauthentication_token,
  email_change,
  phone_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  phone_change_sent_at,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@clean.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW()
);

-- 4. Verificar se o usuário foi criado
SELECT email, id, email_confirmed_at FROM auth.users WHERE email = 'admin@clean.com';