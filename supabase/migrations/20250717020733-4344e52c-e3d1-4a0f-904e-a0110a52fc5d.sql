-- Verificar e ajustar políticas RLS para o registro funcionar

-- Permitir inserção de perfis pelo sistema/trigger
CREATE POLICY "Allow system profile creation" 
ON public.profiles 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Permitir atualização de perfis para o admin quando se registrar  
CREATE POLICY "Allow admin profile update during registration" 
ON public.profiles 
FOR UPDATE 
TO authenticated, anon
USING (username = 'souzamkt0' OR auth.uid() = user_id);

-- Permitir inserção de referrals
CREATE POLICY "Allow referral creation" 
ON public.referrals 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);