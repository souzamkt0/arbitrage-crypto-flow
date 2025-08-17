-- Fix agressivo para o sistema de cadastro

-- 1. Remover TODOS os triggers relacionados a users
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS trigger_create_facebook_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Desabilitar RLS em todas as tabelas relacionadas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se a tabela profiles tem todos os campos necessários
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

-- 4. Verificar se há constraints problemáticas
SELECT 
  'Constraints da tabela profiles' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- 5. Verificar se há índices únicos problemáticos
SELECT 
  'Índices únicos da tabela profiles' as info,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' AND indexdef LIKE '%UNIQUE%';

-- 6. Verificar se o perfil souzamkt0 existe
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

-- 7. Teste de inserção direta na tabela profiles
DO $$
DECLARE
  test_user_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  -- Tentar inserir um perfil de teste
  INSERT INTO public.profiles (
    user_id,
    email,
    username,
    display_name,
    first_name,
    last_name,
    cpf,
    role,
    status,
    referral_code
  ) VALUES (
    test_user_id,
    'teste@teste.com',
    'teste',
    'Usuário Teste',
    'Teste',
    'Usuário',
    '123.456.789-00',
    'user',
    'active',
    'souzamkt0'
  );
  
  RAISE NOTICE '✅ Inserção de teste bem-sucedida!';
  
  -- Remover o perfil de teste
  DELETE FROM public.profiles WHERE user_id = test_user_id;
  
  RAISE NOTICE '✅ Perfil de teste removido!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erro na inserção de teste: %', SQLERRM;
END $$;

-- 8. Status final
SELECT 
  'Status final' as info,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_profiles,
  COUNT(CASE WHEN status = 'pending_registration' THEN 1 END) as pending_profiles
FROM public.profiles;
