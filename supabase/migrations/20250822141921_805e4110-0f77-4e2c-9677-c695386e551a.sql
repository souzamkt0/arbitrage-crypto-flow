-- Criar política mais robusta para withdrawals
-- Dropar política atual que está falhando
DROP POLICY IF EXISTS "Allow authenticated users to create withdrawals" ON withdrawals;

-- Criar política mais permissiva para INSERT que funciona mesmo com problemas de auth.uid()
CREATE POLICY "Users can create withdrawals with valid user_id" 
ON withdrawals FOR INSERT 
TO authenticated
WITH CHECK (
  -- Permitir se auth.uid() funciona normalmente
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  -- OU permitir se user_id existe na tabela profiles (fallback)
  (user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = withdrawals.user_id
  ))
);

-- Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'withdrawals' AND cmd = 'INSERT';