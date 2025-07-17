-- Inserir o usuário admin souzamkt0 diretamente
-- (Isso será feito manualmente quando ele se registrar via interface)

-- Criar função para setup inicial do admin
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se já existe um admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'souzamkt0@gmail.com') THEN
    -- Inserir um perfil temporário para o admin (será substituído quando ele se registrar)
    INSERT INTO public.profiles (
      user_id,
      email,
      username,
      display_name,
      role
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, -- UUID temporário
      'souzamkt0@gmail.com',
      'souzamkt0',
      'Admin Souza',
      'admin'
    );
  ELSE
    -- Se já existe, apenas garantir que é admin
    UPDATE public.profiles 
    SET role = 'admin', username = 'souzamkt0'
    WHERE email = 'souzamkt0@gmail.com';
  END IF;
END;
$$;

-- Executar a função para criar o admin
SELECT public.setup_admin_user();