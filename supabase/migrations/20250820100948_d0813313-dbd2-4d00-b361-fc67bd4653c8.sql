-- CORREÇÃO SIMPLES E DIRECIONADA DO LOGIN
-- Corrigir o erro de digitação e focar no essencial

-- 1. Deletar usuários problemáticos existentes
DELETE FROM auth.users WHERE email IN ('admin@clean.com', 'admin@final.com');

-- 2. Corrigir TODOS os campos NULL problemáticos em usuários existentes
UPDATE auth.users 
SET 
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  phone_change_token = '',
  reauthentication_token = '',
  email_change = '',
  phone_change = ''
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change_token_current IS NULL 
   OR phone_change_token IS NULL 
   OR reauthentication_token IS NULL 
   OR email_change IS NULL 
   OR phone_change IS NULL;

-- 3. Criar usuário admin limpo e simples
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
  '{"email":"admin@clean.com"}',
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW()
);

-- 4. Verificar se o usuário foi criado corretamente
SELECT 'Usuário criado:', email, id, email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'admin@clean.com';