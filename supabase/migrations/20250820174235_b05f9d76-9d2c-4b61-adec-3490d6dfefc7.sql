-- Atualizar a política RLS para permitir que admins vejam indicações
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  is_admin(auth.uid()) OR
  -- Permitir que usuários vejam perfis de seus indicados
  (auth.uid() IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())) OR
  -- Permitir que vejam usuários indicados por eles
  (user_id IN (SELECT user_id FROM profiles WHERE referred_by = auth.uid()))
);