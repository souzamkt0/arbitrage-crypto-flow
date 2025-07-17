-- Remover foreign key constraints problemáticas temporariamente
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;

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
    WHERE username = 'souzamkt0';
    
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

-- Recriar foreign keys apenas para novos registros válidos
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_id_fkey 
FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Validar constraint apenas para novos registros
ALTER TABLE public.referrals VALIDATE CONSTRAINT referrals_referred_id_fkey;