-- TESTE EXTREMO: Desabilitar RLS completamente para testar
-- Isso é TEMPORÁRIO apenas para diagnosticar o problema

-- Desabilitar RLS na tabela withdrawals
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- Verificar o status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'withdrawals';