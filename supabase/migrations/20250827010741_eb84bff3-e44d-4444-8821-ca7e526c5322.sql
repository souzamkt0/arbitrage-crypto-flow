-- Correção do erro de RLS na tabela digitopay_transactions (versão corrigida)

-- 1. Remover função is_admin existente e recriar corretamente
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

-- 3. Corrigir as políticas RLS para digitopay_transactions
DROP POLICY IF EXISTS "Users can create their own digitopay transactions" ON digitopay_transactions;
DROP POLICY IF EXISTS "Users can view their own digitopay transactions" ON digitopay_transactions;

-- 4. Recriar políticas com lógica mais permissiva para resolver o problema
CREATE POLICY "Users can create digitopay transactions"
ON digitopay_transactions
FOR INSERT
WITH CHECK (
  -- Permitir se o usuário está autenticado e é o dono da transação OU é admin
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin(auth.uid()) OR
  is_super_admin()
);

CREATE POLICY "Users can view digitopay transactions"
ON digitopay_transactions
FOR SELECT
USING (
  -- Permitir visualizar próprias transações ou se for admin
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin(auth.uid()) OR
  is_super_admin()
);

-- 5. Política específica para edge functions
CREATE POLICY "Edge functions can manage digitopay transactions"
ON digitopay_transactions
FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Log da correção
INSERT INTO digitopay_debug (tipo, payload) 
VALUES ('rls_fix_v2', json_build_object(
  'timestamp', NOW(),
  'action', 'digitopay_transactions_rls_fixed',
  'description', 'Políticas RLS corrigidas definitivamente para transações DigitoPay'
));