-- Adicionar política RLS para permitir pagamentos públicos/anônimos
CREATE POLICY "Allow public payment creation"
ON public.payments
FOR INSERT
WITH CHECK (
  -- Permitir inserção se for um pagamento público (user_id com prefixo 'public_')
  user_id::text LIKE 'public_%' 
  OR 
  -- Ou se for um usuário autenticado normal
  auth.uid() = user_id
);

-- Permitir que pagamentos públicos sejam visualizados pelo sistema
CREATE POLICY "System can view public payments"
ON public.payments
FOR SELECT
USING (
  user_id::text LIKE 'public_%' 
  OR 
  auth.uid() = user_id 
  OR 
  is_admin(auth.uid())
);