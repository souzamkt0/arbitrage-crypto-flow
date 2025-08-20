-- RECRIAR PERFIL E ROLE PARA O NOVO USUÁRIO

-- 1. Criar perfil na tabela profiles
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
  u.id,
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
FROM auth.users u
WHERE u.email = 'admin@clean.com';

-- 2. Criar role na tabela user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE u.email = 'admin@clean.com';

-- 3. Verificar se tudo foi criado corretamente
SELECT 
  'Sistema completo criado:' as status,
  u.email,
  p.role as profile_role,
  ur.role as user_role,
  public.has_role(u.id, 'admin'::app_role) as has_admin_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@clean.com';