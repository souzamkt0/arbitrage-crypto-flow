-- Remover a foreign key constraint completamente por enquanto
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Verificar se já existe o perfil souzamkt0
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'souzamkt0') THEN
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
      'temp_admin@system.local',
      'souzamkt0',
      'Admin Principal (Registro pendente)',
      'admin',
      10000.00,
      0.00,
      0.00,
      'active'
    );
  END IF;
END $$;