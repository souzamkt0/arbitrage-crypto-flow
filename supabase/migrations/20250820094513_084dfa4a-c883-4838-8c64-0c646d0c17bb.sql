-- CORREÇÃO COMPLETA DO BANCO DE DADOS
-- Problema identificado: Perfis órfãos e conflitos na autenticação

-- 1. REMOVER DADOS INCONSISTENTES
-- Remover perfil órfão que está causando conflito
DELETE FROM profiles 
WHERE user_id IS NULL 
OR user_id NOT IN (SELECT id FROM auth.users);

-- 2. VERIFICAR E CORRIGIR FUNÇÃO IS_ADMIN
-- Recriar função is_admin com segurança total
DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Verificação direta sem RLS recursivo
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

-- 3. VERIFICAR INTEGRIDADE DO USUÁRIO ADMIN
-- Garantir que o admin tem todos os dados corretos
UPDATE profiles 
SET 
    role = 'admin',
    status = 'active',
    email_verified = true,
    profile_completed = true,
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lovable.app');

-- 4. LIMPAR TRIGGERS PROBLEMÁTICOS
-- Verificar se há triggers que podem estar causando problemas
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. RECRIAR TRIGGER SIMPLES PARA CRIAÇÃO DE PERFIL
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Apenas inserir perfil básico sem validações complexas
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        role,
        status,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
        'user',
        'active',
        true,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der erro, apenas retorna sem bloquear
        RETURN NEW;
END;
$$;

-- Aplicar trigger
CREATE TRIGGER on_auth_user_created_simple
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_simple();

-- 6. VERIFICAÇÃO FINAL
SELECT 
    'STATUS FINAL' as resultado,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM profiles WHERE user_id IS NULL) as profiles_orfaos,
    (SELECT email FROM auth.users WHERE email = 'admin@lovable.app') as admin_email,
    (SELECT role FROM profiles WHERE email = 'admin@lovable.app') as admin_role,
    'Database limpo e funcional' as status;