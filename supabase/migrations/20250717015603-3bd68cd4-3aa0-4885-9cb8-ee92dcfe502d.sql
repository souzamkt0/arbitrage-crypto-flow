-- Criar o usuário admin diretamente na tabela profiles
-- Este será o usuário master do sistema

INSERT INTO public.profiles (
  user_id,
  email,
  username, 
  display_name,
  role,
  balance,
  referral_balance,
  residual_balance
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'souzamkt0@gmail.com',
  'souzamkt0',
  'Admin Souza (Master)',
  'admin',
  10000.00,
  0.00,
  0.00
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  email = 'souzamkt0@gmail.com',
  username = 'souzamkt0',
  display_name = 'Admin Souza (Master)';

-- Garantir que este usuário possa ser usado como referência
-- Criar função para login admin temporário
CREATE OR REPLACE FUNCTION public.admin_login(admin_email text, admin_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile public.profiles%ROWTYPE;
BEGIN
  -- Verificar se é o admin
  SELECT * INTO admin_profile 
  FROM public.profiles 
  WHERE email = admin_email AND role = 'admin';
  
  IF admin_profile.email IS NULL THEN
    RETURN jsonb_build_object('error', 'Admin não encontrado');
  END IF;
  
  -- Verificar senha (simples para admin master)
  IF admin_password = '123456' THEN
    RETURN jsonb_build_object(
      'success', true,
      'user_id', admin_profile.user_id,
      'email', admin_profile.email,
      'role', admin_profile.role,
      'username', admin_profile.username
    );
  ELSE
    RETURN jsonb_build_object('error', 'Senha incorreta');
  END IF;
END;
$$;