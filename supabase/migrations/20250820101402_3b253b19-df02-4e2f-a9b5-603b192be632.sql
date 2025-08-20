-- CORREÇÃO RADICAL - LIMPAR TUDO E RECRIAR
-- Vamos deletar TODOS os usuários e criar um totalmente novo

-- 1. Deletar TODOS os usuários existentes
DELETE FROM auth.users;

-- 2. Deletar todos os perfis
DELETE FROM public.profiles;
DELETE FROM public.user_roles;

-- 3. Criar um usuário completamente novo especificando TODOS os campos
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
  deleted_at,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "admin@clean.com"}',
  false,
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
  NULL,
  false
);

-- 4. Verificar se o usuário foi criado e obter seu ID
SELECT 'Usuário recriado:', email, id
FROM auth.users 
WHERE email = 'admin@clean.com';