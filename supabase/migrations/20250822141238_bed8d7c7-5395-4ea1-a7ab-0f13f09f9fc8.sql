-- Criar uma política temporária para debug
-- Primeiro, desabilitar RLS temporariamente para testar
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'withdrawals';