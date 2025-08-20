-- IMPLEMENTAR SISTEMA DE ROLES CORRETO CONFORME SUPABASE BEST PRACTICES
-- E verificar se ainda há problemas na auth.users

-- 1. Primeiro verificar se há usuários com campos NULL problemáticos
SELECT 
  email,
  email_change IS NULL as email_change_null,
  email_change_token_new IS NULL as token_new_null,
  email_change_token_current IS NULL as token_current_null,
  confirmation_token IS NULL as confirm_token_null
FROM auth.users 
WHERE email_change IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change_token_current IS NULL 
   OR confirmation_token IS NULL
LIMIT 5;

-- 2. Criar enum para roles
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'partner');

-- 3. Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 4. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Atribuir role admin ao usuário admin@clean.com
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE u.email = 'admin@clean.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Verificar se tudo foi criado corretamente
SELECT 
  'Sistema de roles criado:' as status,
  u.email,
  ur.role,
  public.has_role(u.id, 'admin'::app_role) as is_admin
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@clean.com';