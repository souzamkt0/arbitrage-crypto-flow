-- Corrigir verificação de admin para o usuário atual

-- Primeiro, verificar o usuário atual e sua sessão
SELECT 
    'Usuário atual' as info,
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as current_email;

-- Verificar se o usuário souzamkt0@gmail.com existe e tem role de admin
SELECT 
    'Verificação Admin Souza' as info,
    user_id,
    email,
    role,
    display_name
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- Verificar a função is_admin atual
SELECT 
    'Função is_admin' as info,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- Atualizar a função is_admin para ser mais robusta
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Se não há user_id, não é admin
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar email e role do usuário
  SELECT email, role INTO user_email, user_role
  FROM public.profiles 
  WHERE profiles.user_id = check_user_id;
  
  -- Verificar se é admin por email direto (emails hardcoded de admin)
  IF user_email = 'admin@clean.com' OR user_email = 'souzamkt0@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se é admin por role na tabela profiles
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false por segurança
    RETURN FALSE;
END;
$$;

-- Garantir que souzamkt0@gmail.com tem role de admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'souzamkt0@gmail.com';

-- Testar a função is_admin
SELECT 
    'Teste is_admin' as info,
    is_admin() as result_current_user,
    (SELECT is_admin(user_id) FROM profiles WHERE email = 'souzamkt0@gmail.com') as result_souza;

-- Verificar se as políticas estão usando a função correta
SELECT 
    policyname,
    qual
FROM pg_policies 
WHERE qual LIKE '%is_admin%'
LIMIT 5;