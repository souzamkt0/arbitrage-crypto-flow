-- Correção do erro de RLS (versão corrigida)

-- 1. Remover função existente e recriar
DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
$$;

-- 2. Função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid;
$$;

-- 3. Remover políticas existentes
DROP POLICY IF EXISTS "Users can create their own digitopay transactions" ON digitopay_transactions;
DROP POLICY IF EXISTS "Users can view their own digitopay transactions" ON digitopay_transactions;

-- 4. Criar política simples e robusta para inserção
CREATE POLICY "Allow authenticated users to create transactions"
ON digitopay_transactions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- 5. Política para visualização
CREATE POLICY "Allow users to view own transactions"
ON digitopay_transactions
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- 6. Log da correção
INSERT INTO digitopay_debug (tipo, payload) 
VALUES ('rls_fix_v2', json_build_object(
  'timestamp', NOW(),
  'action', 'simplified_rls_policies_for_digitopay_transactions',
  'description', 'Políticas RLS simplificadas e corrigidas'
));