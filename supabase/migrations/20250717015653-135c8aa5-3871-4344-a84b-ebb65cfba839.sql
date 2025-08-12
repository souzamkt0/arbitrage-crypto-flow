-- Criar um usuário temporário para permitir o sistema funcionar 
-- Este usuário será substituído quando o admin real se registrar
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
  gen_random_uuid(),
  'temp_souzamkt0@system.local',
  'souzamkt0',
  'Admin Souza (Aguardando registro)',
  'admin',
  0.00,
  0.00,
  0.00,
  'inactive'
) ON CONFLICT (username) DO UPDATE SET
  display_name = 'Admin Souza (Aguardando registro)',
  status = 'inactive';

-- Função para atualizar o admin temporário quando ele se registrar
CREATE OR REPLACE FUNCTION public.update_admin_on_register()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o email que está se registrando é o admin
  IF NEW.email = 'souzamkt0@gmail.com' THEN
    -- Atualizar o perfil temporário com o user_id real
    UPDATE public.profiles 
    SET 
      user_id = NEW.user_id,
      email = NEW.email,
      status = 'active',
      display_name = COALESCE(NEW.display_name, 'Admin Souza'),
      role = 'admin'
    WHERE username = 'souzamkt0' AND email = 'temp_souzamkt0@system.local';
    
    -- Se a atualização não afetou nenhuma linha, inserir novo perfil
    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        user_id, email, username, display_name, role
      ) VALUES (
        NEW.user_id, NEW.email, 'souzamkt0', 'Admin Souza', 'admin'
      );
    END IF;
    
    RETURN NULL; -- Evita inserção duplicada
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para interceptar o registro do admin
DROP TRIGGER IF EXISTS admin_register_trigger ON public.profiles;
CREATE TRIGGER admin_register_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.email = 'souzamkt0@gmail.com')
  EXECUTE FUNCTION public.update_admin_on_register();