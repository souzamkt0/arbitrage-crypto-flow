-- CRIAR PERFIL PARA O USUÁRIO ADMIN@CLEAN.COM
-- Buscar o ID do usuário admin@clean.com e criar seu perfil

-- Primeiro, obter o user_id do admin@clean.com
WITH admin_user AS (
  SELECT id as user_id FROM auth.users WHERE email = 'admin@clean.com'
)
INSERT INTO public.profiles (
  user_id,
  email,
  display_name,
  username,
  first_name,
  last_name,
  bio,
  avatar,
  referral_code,
  role,
  balance,
  total_profit,
  status,
  profile_completed,
  email_verified,
  created_at,
  updated_at
)
SELECT 
  admin_user.user_id,
  'admin@clean.com',
  'Administrador',
  'admin',
  'Admin',
  'System',
  'Administrador do sistema',
  'avatar1',
  'admin_master',
  'admin',
  0.00,
  0.00,
  'active',
  true,
  true,
  NOW(),
  NOW()
FROM admin_user
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  email = 'admin@clean.com',
  display_name = 'Administrador',
  username = 'admin',
  profile_completed = true,
  email_verified = true,
  updated_at = NOW();

-- Verificar se o perfil foi criado
SELECT 'Perfil criado/atualizado:', email, role, display_name, profile_completed
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@clean.com';