-- Verificar e corrigir as políticas RLS da tabela withdrawals
-- Primeiro, dropar as políticas existentes para recriar
DROP POLICY IF EXISTS "Enable insert for users and admins" ON withdrawals;
DROP POLICY IF EXISTS "Enable select for users and admins" ON withdrawals;
DROP POLICY IF EXISTS "Enable update for admins only" ON withdrawals;
DROP POLICY IF EXISTS "Enable delete for admins only" ON withdrawals;

-- Criar políticas mais robustas para withdrawals
-- Política para INSERT: permite usuários criarem seus próprios saques OU admins criarem qualquer saque
CREATE POLICY "Users can create their own withdrawals" 
ON withdrawals FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@clean.com', 'souzamkt0@gmail.com')
  )
);

-- Política para SELECT: permite usuários verem seus próprios saques OU admins verem todos
CREATE POLICY "Users can view their own withdrawals" 
ON withdrawals FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@clean.com', 'souzamkt0@gmail.com')
  )
);

-- Política para UPDATE: apenas admins podem atualizar saques
CREATE POLICY "Admins can update withdrawals" 
ON withdrawals FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@clean.com', 'souzamkt0@gmail.com')
  )
);

-- Política para DELETE: apenas admins podem deletar saques
CREATE POLICY "Admins can delete withdrawals" 
ON withdrawals FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@clean.com', 'souzamkt0@gmail.com')
  )
);

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'withdrawals'
ORDER BY policyname;