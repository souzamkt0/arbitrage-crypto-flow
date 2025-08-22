-- Corrigir políticas RLS da tabela withdrawals
-- Remover políticas conflitantes e criar uma política clara

-- Remover todas as políticas existentes para withdrawals
DROP POLICY IF EXISTS "Admins can delete withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals; 
DROP POLICY IF EXISTS "Admins have full control over withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON withdrawals;

-- Criar políticas claras e não conflitantes
CREATE POLICY "Enable insert for users and admins" ON withdrawals
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR is_admin(auth.uid())
);

CREATE POLICY "Enable select for users and admins" ON withdrawals  
FOR SELECT USING (
  auth.uid() = user_id OR is_admin(auth.uid())
);

CREATE POLICY "Enable update for admins only" ON withdrawals
FOR UPDATE USING (
  is_admin(auth.uid())
);

CREATE POLICY "Enable delete for admins only" ON withdrawals
FOR DELETE USING (
  is_admin(auth.uid())
);