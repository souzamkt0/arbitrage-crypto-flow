-- Criar dados de teste para verificar se o painel admin funciona
-- Inserir alguns investimentos de teste com end_date
INSERT INTO user_investments (user_id, plan_id, amount, daily_rate, status, created_at, end_date)
SELECT 
  p.user_id,
  ip.id,
  CASE 
    WHEN RANDOM() < 0.3 THEN 100.00
    WHEN RANDOM() < 0.6 THEN 500.00 
    ELSE 1000.00
  END as amount,
  ip.daily_rate,
  'active' as status,
  NOW() - (RANDOM() * interval '30 days') as created_at,
  NOW() + (ip.duration_days || ' days')::INTERVAL as end_date
FROM profiles p
CROSS JOIN investment_plans ip
WHERE p.role = 'user'
AND ip.status = 'active'
AND RANDOM() < 0.4 -- 40% chance de ter investimento
LIMIT 5;

-- Inserir alguns saques de teste
INSERT INTO withdrawals (user_id, amount, net_amount, status, created_at, pix_key, pix_key_type)
SELECT 
  p.user_id,
  ROUND(RANDOM() * 500 + 50, 2) as amount,
  ROUND((RANDOM() * 500 + 50) * 0.95, 2) as net_amount,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'pending'
    WHEN RANDOM() < 0.7 THEN 'approved'
    ELSE 'processing'
  END as status,
  NOW() - (RANDOM() * interval '15 days') as created_at,
  p.email as pix_key,
  'email' as pix_key_type
FROM profiles p
WHERE p.role = 'user'
AND RANDOM() < 0.3 -- 30% chance de ter saque
LIMIT 3;

-- Verificar se agora temos dados
SELECT 
  'DADOS CRIADOS' as status,
  (SELECT COUNT(*) FROM user_investments) as total_investments,
  (SELECT COUNT(*) FROM withdrawals) as total_withdrawals,
  (SELECT COUNT(*) FROM deposits) as total_deposits,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins;