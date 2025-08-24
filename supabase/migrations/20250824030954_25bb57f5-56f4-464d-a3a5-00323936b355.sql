-- Debug da função is_admin
SELECT 
    'Debug função is_admin' as info,
    auth.uid() as current_auth_uid,
    is_admin(auth.uid()) as is_admin_result,
    is_admin('3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid) as is_admin_hardcoded;

-- Verificar usuário admin@clean.com
SELECT 
    'Verificação Admin Clean' as info,
    u.id as user_id,
    u.email,
    p.role,
    p.email as profile_email,
    CASE 
        WHEN u.email = 'admin@clean.com' THEN 'Email correto'
        ELSE 'Email incorreto'
    END as email_check
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@clean.com';

-- Corrigir função is_admin para garantir que admin@clean.com sempre seja admin
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

-- Garantir que admin@clean.com tenha role admin
UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@clean.com';

-- Teste final
SELECT 
    'Teste Final is_admin' as info,
    is_admin('3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid) as admin_hardcoded,
    (SELECT is_admin(user_id) FROM profiles WHERE email = 'admin@clean.com') as admin_by_email;