-- Corrigir política RLS para permitir que usuários vejam seu próprio perfil
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Política simples e funcional
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  -- Usuario pode ver seu proprio perfil (conversão explícita)
  (user_id = auth.uid()) OR
  -- Admin pode ver tudo (ID específico hardcoded)
  (auth.uid() = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid) OR
  -- Qualquer usuário autenticado pode ver perfis de seus indicados
  (referred_by IS NOT NULL AND referred_by = auth.uid()::text)
);