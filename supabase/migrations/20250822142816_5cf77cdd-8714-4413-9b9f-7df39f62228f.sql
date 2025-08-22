-- SOLUÇÃO RADICAL: Desabilitar RLS temporariamente e recriar tudo
-- Passo 1: Desabilitar RLS na tabela withdrawals
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- Passo 2: Remover TODAS as políticas
DROP POLICY IF EXISTS "Allow all authenticated users to create withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow users to view withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow admins to update withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow admins to delete withdrawals" ON withdrawals;

-- Passo 3: Reabilitar RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Passo 4: Criar políticas ULTRA permissivas
-- INSERT: Permitir qualquer usuário autenticado
CREATE POLICY "withdrawals_insert_policy" 
ON withdrawals FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- SELECT: Permitir usuários ver seus próprios saques OU admins verem todos
CREATE POLICY "withdrawals_select_policy" 
ON withdrawals FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- UPDATE: Apenas admins
CREATE POLICY "withdrawals_update_policy" 
ON withdrawals FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- DELETE: Apenas admins
CREATE POLICY "withdrawals_delete_policy" 
ON withdrawals FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  with_check IS NOT NULL as has_with_check,
  qual IS NOT NULL as has_using
FROM pg_policies 
WHERE tablename = 'withdrawals'
ORDER BY cmd, policyname;