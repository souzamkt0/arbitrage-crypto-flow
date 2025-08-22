-- Corrigir permissões de admin garantindo que souzamkt0@gmail.com seja admin

-- Primeiro, verificar o usuário atual
SELECT 
    'Estado atual' as info,
    user_id,
    email,
    role,
    display_name
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- Garantir que souzamkt0@gmail.com tem role de admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'souzamkt0@gmail.com';

-- Verificar após o update
SELECT 
    'Após update' as info,
    user_id,
    email,
    role,
    display_name
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- Atualizar a função is_admin sem trocar a assinatura
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
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
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar email e role do usuário
  SELECT email, role INTO user_email, user_role
  FROM public.profiles 
  WHERE profiles.user_id = is_admin.user_id;
  
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

-- Testar a função is_admin com o usuário souzamkt0
SELECT 
    'Teste final' as info,
    (SELECT is_admin(user_id) FROM profiles WHERE email = 'souzamkt0@gmail.com') as souza_is_admin,
    is_admin(auth.uid()) as current_user_is_admin;

-- Verificar todas as contas de admin
SELECT 
    'Todos os admins' as info,
    email,
    role,
    is_admin(user_id) as admin_check
FROM profiles 
WHERE role = 'admin' OR email IN ('souzamkt0@gmail.com', 'admin@clean.com');