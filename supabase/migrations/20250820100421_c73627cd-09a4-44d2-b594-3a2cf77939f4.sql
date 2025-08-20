-- CORREÇÃO DEFINITIVA PARA PROBLEMAS DE LOGIN
-- Fix all NULL values in auth.users that are causing scan errors

-- 1. Update all problematic NULL columns in auth.users
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
  reauthentication_sent_at = COALESCE(reauthentication_sent_at, NOW())
WHERE id IS NOT NULL;

-- 2. Delete any corrupted users and recreate clean admin user
DELETE FROM auth.users WHERE email IN ('admin@final.com', 'admin@clean.com');

-- 3. Create new clean admin user with all required fields
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
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
  is_super_admin,
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
  NOW(),
  NOW(),
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '', -- empty string instead of NULL
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"role":"admin"}',
  false,
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW()
);

-- 4. Set up RLS policy for auth access if needed
-- (This is usually handled by Supabase automatically)

-- 5. Ensure email confirmation is disabled for this user
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@clean.com';