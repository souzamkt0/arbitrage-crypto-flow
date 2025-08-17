-- Script para desabilitar trigger e verificar estrutura

-- 1. Desabilitar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Verificar constraints da tabela
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- 4. Verificar se há algum trigger ativo
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 5. Verificar RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 6. Desabilitar RLS se estiver ativo
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 7. Verificar se há dados na tabela
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_profiles,
  COUNT(CASE WHEN status = 'pending_registration' THEN 1 END) as pending_profiles
FROM public.profiles;
