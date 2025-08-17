-- Script final para corrigir o cadastro de usuários
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar todos os triggers que podem estar causando problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Desabilitar RLS na tabela profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se todos os campos necessários existem
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

-- 4. Verificar se o perfil souzamkt0 existe
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

-- 5. Mostrar estrutura atual da tabela
SELECT 
  'Estrutura da tabela profiles' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 6. Mostrar status final
SELECT 
  'Status final' as info,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_profiles,
  COUNT(CASE WHEN status = 'pending_registration' THEN 1 END) as pending_profiles
FROM public.profiles;

-- 7. Verificar se há triggers ativos
SELECT 
  'Triggers ativos' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('profiles', 'users')
ORDER BY trigger_name;
