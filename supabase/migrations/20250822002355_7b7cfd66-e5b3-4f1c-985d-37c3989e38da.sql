-- Criar dados de teste simples para verificar se o painel admin funciona
-- Inserir alguns investimentos de teste com todos os campos obrigatórios
INSERT INTO user_investments (
  user_id, 
  plan_id, 
  amount, 
  daily_rate, 
  status, 
  created_at, 
  end_date, 
  total_operations,
  operations_completed,
  total_earned,
  today_earnings,
  current_day_progress
)
SELECT 
  p.user_id,
  ip.id,
  500.00 as amount,
  ip.daily_rate,
  'active' as status,
  NOW() - interval '10 days' as created_at,
  NOW() + (ip.duration_days || ' days')::INTERVAL as end_date,
  100 as total_operations,
  10 as operations_completed,
  50.00 as total_earned,
  5.00 as today_earnings,
  25.5 as current_day_progress
FROM profiles p
CROSS JOIN investment_plans ip
WHERE p.role = 'user'
AND ip.status = 'active'
LIMIT 2;

-- Verificar dados finais
SELECT 
  'STATUS FINAL' as check_type,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admins,
  (SELECT COUNT(*) FROM profiles WHERE role = 'user') as users,
  (SELECT COUNT(*) FROM user_investments) as investments,
  (SELECT COUNT(*) FROM deposits) as deposits,
  (SELECT COUNT(*) FROM withdrawals) as withdrawals;