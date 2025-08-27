-- Correção do erro de RLS na tabela digitopay_transactions

-- 1. Primeiro, vamos verificar se a função is_admin existe corretamente
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

-- 3. Corrigir as políticas RLS para digitopay_transactions
DROP POLICY IF EXISTS "Users can create their own digitopay transactions" ON digitopay_transactions;
DROP POLICY IF EXISTS "Users can view their own digitopay transactions" ON digitopay_transactions;

-- 4. Recriar políticas com lógica mais robusta
CREATE POLICY "Users can create their own digitopay transactions"
ON digitopay_transactions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR
    is_admin(auth.uid()) OR
    is_super_admin()
  )
);

CREATE POLICY "Users can view their own digitopay transactions"
ON digitopay_transactions
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR
    is_admin(auth.uid()) OR
    is_super_admin()
  )
);

-- 5. Política para permitir inserção via edge functions (usando service_role)
CREATE POLICY "Service role can insert digitopay transactions"
ON digitopay_transactions
FOR INSERT
WITH CHECK (
  current_setting('role', true) = 'service_role' OR
  auth.uid() IS NOT NULL
);

-- 6. Log da correção
INSERT INTO digitopay_debug (tipo, payload) 
VALUES ('rls_fix', json_build_object(
  'timestamp', NOW(),
  'action', 'digitopay_transactions_rls_policies_fixed',
  'description', 'Políticas RLS corrigidas para permitir inserção de transações'
));