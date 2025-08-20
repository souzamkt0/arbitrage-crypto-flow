-- Simplificar a política RLS para resolver o problema
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  is_admin(auth.uid()) OR
  -- Permitir que vejam usuários indicados por eles (convertendo referred_by para uuid)
  (referred_by::uuid = auth.uid())
);