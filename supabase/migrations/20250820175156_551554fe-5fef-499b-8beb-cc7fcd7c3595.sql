-- Corrigir as políticas RLS - ajustando os tipos de dados
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Política corrigida com conversões de tipo apropriadas
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  -- Usuario pode ver seu proprio perfil
  (auth.uid() = user_id) OR
  -- Admin específico pode ver tudo
  (auth.uid()::text = '3df866ff-b7f7-4f56-9690-d12ff9c10944') OR
  -- Qualquer usuário autenticado pode ver perfis de seus indicados
  (referred_by IS NOT NULL AND (
    referred_by::uuid = auth.uid() OR
    referred_by = auth.uid()::text
  ))
);