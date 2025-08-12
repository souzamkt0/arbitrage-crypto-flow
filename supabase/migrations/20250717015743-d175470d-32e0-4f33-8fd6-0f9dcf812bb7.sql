-- Verificar se já existe o perfil souzamkt0
DO $$
BEGIN
  -- Se não existe, criar um perfil temporário sem foreign key
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'souzamkt0') THEN
    -- Temporariamente desabilitar foreign key
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
    
    -- Inserir perfil temporário
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
      'pending_registration'
    );
    
    -- Recriar foreign key
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Melhorar a função handle_new_user para lidar com o admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ref_code text;
  referrer_user_id uuid;
  generated_username text;
BEGIN
  -- Extrair código de referência do metadata
  ref_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Se é o admin se registrando, atualizar o perfil existente
  IF NEW.email = 'souzamkt0@gmail.com' THEN
    UPDATE public.profiles 
    SET 
      user_id = NEW.id,
      email = NEW.email,
      display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', 'Admin Souza'),
      status = 'active'
    WHERE username = 'souzamkt0' AND status = 'pending_registration';
    
    RETURN NEW;
  END IF;
  
  -- Para outros usuários, gerar username único baseado no email
  generated_username := split_part(NEW.email, '@', 1);
  
  -- Verificar se o username já existe e torná-lo único se necessário
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || floor(random() * 1000)::text;
  END LOOP;
  
  -- Inserir perfil do usuário
  INSERT INTO public.profiles (
    user_id, 
    email, 
    display_name, 
    username,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    generated_username,
    'user'
  );
  
  -- Se tem código de referência, criar o relacionamento
  IF ref_code IS NOT NULL THEN
    -- Buscar o referrer pelo username/código
    SELECT user_id INTO referrer_user_id 
    FROM public.profiles 
    WHERE username = lower(ref_code);
    
    -- Se encontrou o referrer, criar o relacionamento
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_id, 
        referral_code,
        commission_rate,
        status
      ) VALUES (
        referrer_user_id,
        NEW.id,
        ref_code,
        10.00,
        'active'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;