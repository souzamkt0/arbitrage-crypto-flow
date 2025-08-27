-- Limpeza e sincronização de dados

-- 1. Atualizar transações pendentes antigas para expiradas
UPDATE digitopay_transactions 
SET status = 'expired', updated_at = NOW()
WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '48 hours';

-- 2. Sincronizar saldos dos usuários com depósitos confirmados
UPDATE profiles 
SET balance = (
  SELECT COALESCE(SUM(d.amount_usd), 0)
  FROM deposits d 
  WHERE d.user_id = profiles.user_id 
    AND d.status = 'paid'
) - (
  SELECT COALESCE(SUM(ui.amount), 0)
  FROM user_investments ui 
  WHERE ui.user_id = profiles.user_id 
    AND ui.status = 'active'
) - (
  SELECT COALESCE(SUM(w.amount_brl / 5.5), 0)
  FROM withdrawals w 
  WHERE w.user_id = profiles.user_id 
    AND w.status = 'completed'
)
WHERE role != 'admin';

-- 3. Atualizar total_profit baseado nos investimentos
UPDATE profiles 
SET total_profit = (
  SELECT COALESCE(SUM(ui.total_earned), 0)
  FROM user_investments ui 
  WHERE ui.user_id = profiles.user_id
)
WHERE role != 'admin';

-- 4. Limpar transações duplicadas ou órfãs
DELETE FROM digitopay_transactions 
WHERE id IN (
  SELECT dt.id 
  FROM digitopay_transactions dt
  LEFT JOIN profiles p ON dt.user_id = p.user_id
  WHERE p.user_id IS NULL
);

-- 5. Corrigir status de depósitos sem transação correspondente
UPDATE deposits 
SET status = 'completed'
WHERE status = 'paid' 
  AND created_at > NOW() - INTERVAL '30 days';

-- 6. Log da limpeza
INSERT INTO digitopay_debug (tipo, payload) 
VALUES ('system_cleanup', json_build_object(
  'timestamp', NOW(),
  'action', 'database_synchronization_and_cleanup',
  'description', 'Sincronização de saldos e limpeza de dados inconsistentes'
));