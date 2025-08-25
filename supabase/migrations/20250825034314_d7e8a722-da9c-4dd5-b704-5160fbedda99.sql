-- Corrigir funções principais com SET search_path = 'public'
-- Começando pelas funções de admin mais críticas

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Se não há user_id, não é admin
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Hardcoded admin principal
  IF user_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid THEN
    RETURN TRUE;
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