-- Adicionar permissões completas de edição para administradores
-- Atualizar políticas RLS para permitir que admins editem tudo

-- Política para admins editarem deposits
DROP POLICY IF EXISTS "Admins can update deposits" ON deposits;
CREATE POLICY "Admins can update deposits" ON deposits
FOR UPDATE USING (is_admin(auth.uid()));

-- Política para admins editarem digitopay_transactions  
DROP POLICY IF EXISTS "Admins can update digitopay transactions" ON digitopay_transactions;
CREATE POLICY "Admins can update digitopay transactions" ON digitopay_transactions
FOR UPDATE USING (is_admin(auth.uid()));

-- Política para admins editarem profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (is_admin(auth.uid()));

-- Política para admins editarem withdrawals
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals;
CREATE POLICY "Admins can update withdrawals" ON withdrawals
FOR UPDATE USING (is_admin(auth.uid()));

-- Política para admins editarem user_investments
DROP POLICY IF EXISTS "Admins can update user_investments" ON user_investments;
CREATE POLICY "Admins can update user_investments" ON user_investments
FOR UPDATE USING (is_admin(auth.uid()));

-- Política para admins deletarem registros se necessário
DROP POLICY IF EXISTS "Admins can delete deposits" ON deposits;
CREATE POLICY "Admins can delete deposits" ON deposits
FOR DELETE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete digitopay_transactions" ON digitopay_transactions;
CREATE POLICY "Admins can delete digitopay_transactions" ON digitopay_transactions
FOR DELETE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete withdrawals" ON withdrawals;
CREATE POLICY "Admins can delete withdrawals" ON withdrawals
FOR DELETE USING (is_admin(auth.uid()));

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
WHERE tablename IN ('deposits', 'digitopay_transactions', 'profiles', 'withdrawals', 'user_investments')
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;