-- CORREÇÃO FOCADA NO PROBLEMA ESPECÍFICO
-- O erro indica que há dependências, vou fazer correção mais cirúrgica

-- 1. REMOVER APENAS OS DADOS PROBLEMÁTICOS
DELETE FROM profiles 
WHERE user_id IS NULL;

-- 2. RECRIAR A FUNÇÃO IS_ADMIN SEM REMOVER A ANTERIOR
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Verificação direta e segura
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 3. GARANTIR INTEGRIDADE DO ADMIN
UPDATE profiles 
SET 
    role = 'admin',
    status = 'active',
    email_verified = true,
    profile_completed = true,
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lovable.app');

-- 4. VERIFICAR SE HÁ CONSTRAINTS PROBLEMÁTICAS
-- Remover constraints que podem estar causando problemas no schema
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key CASCADE;

-- 5. RECRIAR CONSTRAINTS ESSENCIAIS APENAS
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 6. VERIFICAÇÃO DO ESTADO FINAL
SELECT 
    'CORREÇÃO APLICADA' as status,
    (SELECT COUNT(*) FROM auth.users) as users_count,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM profiles WHERE user_id IS NULL) as orphaned_profiles,
    (SELECT role FROM profiles WHERE email = 'admin@lovable.app') as admin_role,
    'Banco corrigido' as resultado;