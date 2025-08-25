-- Atualizar política RLS para usar UUID fixo de pagamentos públicos
DROP POLICY IF EXISTS "Allow public payment creation" ON public.payments;
DROP POLICY IF EXISTS "System can view public payments" ON public.payments;

-- Nova política RLS para permitir pagamentos públicos usando UUID fixo
CREATE POLICY "Allow public payment creation"
ON public.payments
FOR INSERT
WITH CHECK (
  -- Permitir inserção se for o UUID fixo de pagamentos públicos
  user_id = '00000000-0000-0000-0000-000000000001'::uuid
  OR 
  -- Ou se for um usuário autenticado normal
  auth.uid() = user_id
);

-- Permitir que pagamentos públicos sejam visualizados pelo sistema
CREATE POLICY "System can view public payments"
ON public.payments
FOR SELECT
USING (
  user_id = '00000000-0000-0000-0000-000000000001'::uuid
  OR 
  auth.uid() = user_id 
  OR 
  is_admin(auth.uid())
);