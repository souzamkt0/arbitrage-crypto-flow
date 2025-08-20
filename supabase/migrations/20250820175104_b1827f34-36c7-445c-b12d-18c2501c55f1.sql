-- Corrigir as políticas RLS para funcionar corretamente
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Política mais simples e funcional
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  -- Usuario pode ver seu proprio perfil
  (auth.uid() = user_id) OR
  -- Admin pode ver tudo
  (auth.uid() = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid) OR
  -- Qualquer usuário autenticado pode ver perfis de seus indicados
  (EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.user_id = auth.uid() 
    AND profiles.referred_by = p2.user_id
  ))
);