-- Adicionar política para permitir consulta de códigos de referência por usuários não autenticados
CREATE POLICY "Allow referral code verification" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Esta política permite que qualquer pessoa consulte os perfis para verificação de códigos de referência
-- É necessário para o sistema de registro funcionar