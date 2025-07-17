-- Remover temporariamente a foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Criar o perfil admin 
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
  'Admin Souza (Aguardando registro real)',
  'admin',
  0.00,
  0.00,
  0.00,
  'active'
) ON CONFLICT (username) DO UPDATE SET
  display_name = 'Admin Souza (Aguardando registro real)',
  role = 'admin';

-- Recriar a foreign key constraint, mas permitindo que registros existentes sejam mantidos
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Validar constraint apenas para novos registros
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_user_id_fkey;