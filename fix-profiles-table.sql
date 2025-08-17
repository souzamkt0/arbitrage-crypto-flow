-- Script para corrigir a tabela profiles e garantir que o cadastro funcione

-- 1. Verificar se os campos necessários existem
DO $$
BEGIN
  -- Adicionar campos se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
    ALTER TABLE public.profiles ADD COLUMN first_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
    ALTER TABLE public.profiles ADD COLUMN last_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cpf') THEN
    ALTER TABLE public.profiles ADD COLUMN cpf text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code text DEFAULT 'souzamkt0';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by') THEN
    ALTER TABLE public.profiles ADD COLUMN referred_by uuid;
  END IF;
END $$;

-- 2. Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Criar ou substituir a função handle_new_user
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
    first_name,
    last_name,
    cpf,
    role,
    referral_code,
    status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    generated_username,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'cpf',
    'user',
    COALESCE(ref_code, 'souzamkt0'),
    'active'
  );
  
  RETURN NEW;
END;
$$;

-- 4. Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar se o perfil souzamkt0 existe
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
      status,
      referral_code
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      'temp_souzamkt0@system.local',
      'souzamkt0',
      'Admin Souza (Registro pendente)',
      'admin',
      0.00,
      0.00,
      0.00,
      'pending_registration',
      'souzamkt0'
    );
  END IF;
END $$;

-- 6. Mostrar status final
SELECT 
  'Tabela profiles corrigida' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_profiles,
  COUNT(CASE WHEN status = 'pending_registration' THEN 1 END) as pending_profiles
FROM public.profiles;
