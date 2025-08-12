-- Criar o perfil admin usando um status válido
INSERT INTO public.profiles (
  user_id,
  email,
  username, 
  display_name,
  role,
  balance,
  referral_balance,
  residual_balance,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'temp_souzamkt0@system.local',
  'souzamkt0',
  'Admin Souza (Registro pendente)',
  'admin',
  0.00,
  0.00,
  0.00,
  'active'
) ON CONFLICT (username) DO UPDATE SET
  display_name = 'Admin Souza (Registro pendente)',
  role = 'admin';