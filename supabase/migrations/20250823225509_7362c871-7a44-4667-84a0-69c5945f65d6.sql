-- Habilitar RLS nas tabelas que não têm
ALTER TABLE digitopay_debug ENABLE ROW LEVEL SECURITY;

-- Verificar quais outras tabelas precisam de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false
AND tablename IN (
  'trading_history', 'trading_profits', 'user_investments', 
  'investment_plans', 'digitopay_debug', 'digitopay_transactions', 
  'profiles', 'deposits', 'withdrawals'
);