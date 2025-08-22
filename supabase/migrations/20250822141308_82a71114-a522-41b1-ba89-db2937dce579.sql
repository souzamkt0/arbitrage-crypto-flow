-- Reabilitar RLS e corrigir as políticas definitivamente
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas antigas para recriar do zero
DROP POLICY IF EXISTS "Admins can delete withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals;  
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON withdrawals;

-- Recriar as políticas de forma mais simples e robusta
-- Política simplificada para INSERT - qualquer usuário autenticado pode criar saque
CREATE POLICY "Allow authenticated users to create withdrawals" 
ON withdrawals FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política simplificada para SELECT - usuários veem seus próprios saques, admins veem todos
CREATE POLICY "Allow users to view own withdrawals and admins all" 
ON withdrawals FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR 
  (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

-- Política para UPDATE - apenas admins podem atualizar
CREATE POLICY "Allow admins to update withdrawals" 
ON withdrawals FOR UPDATE 
TO authenticated
USING ((SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin');

-- Política para DELETE - apenas admins podem deletar
CREATE POLICY "Allow admins to delete withdrawals" 
ON withdrawals FOR DELETE 
TO authenticated
USING ((SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin');

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'withdrawals'
ORDER BY policyname;