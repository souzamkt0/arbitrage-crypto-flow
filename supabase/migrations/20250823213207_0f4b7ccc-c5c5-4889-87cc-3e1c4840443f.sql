-- Criar dados de exemplo para sincronizar com a interface
-- Investimentos para usuários indicados

-- Investimento para jadiel (central22)
INSERT INTO user_investments (
  user_id,
  plan_id,
  amount,
  daily_rate,
  total_earned,
  today_earnings,
  operations_completed,
  total_operations,
  days_remaining,
  status,
  start_date,
  end_date
) VALUES (
  'f721d67a-1f37-4709-92a9-ede89e77717f', -- jadiel
  (SELECT id FROM investment_plans WHERE name LIKE '%4.0.0%' LIMIT 1),
  250.00,
  0.025,
  15.75,
  2.50,
  6,
  40,
  34,
  'active',
  NOW() - INTERVAL '6 days',
  NOW() + INTERVAL '34 days'
);

-- Investimento para LECi (central33)
INSERT INTO user_investments (
  user_id,
  plan_id,  
  amount,
  daily_rate,
  total_earned,
  today_earnings,
  operations_completed,
  total_operations,
  days_remaining,
  status,
  start_date,
  end_date
) VALUES (
  '8072bfbd-b404-47e7-9a48-af43eba3ce70', -- LECi
  (SELECT id FROM investment_plans WHERE name LIKE '%4.0.0%' LIMIT 1),
  150.00,
  0.025,
  8.25,
  1.50,
  4,
  40,
  36,
  'active',
  NOW() - INTERVAL '4 days',
  NOW() + INTERVAL '36 days'
);

-- Investimento para teste hugo (teste22)
INSERT INTO user_investments (
  user_id,
  plan_id,
  amount,
  daily_rate,
  total_earned,
  today_earnings,
  operations_completed,
  total_operations,
  days_remaining,
  status,
  start_date,
  end_date
) VALUES (
  '22ed9e11-fc5f-4a87-8e34-67c8ae073c73', -- teste hugo
  (SELECT id FROM investment_plans WHERE name LIKE '%4.0.0%' LIMIT 1),
  100.00,
  0.025,
  5.50,
  1.00,
  3,
  40,
  37,
  'active',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '37 days'
);

-- Atualizar saldo e lucros dos usuários nos profiles
UPDATE profiles 
SET 
  balance = 265.75,
  total_profit = 15.75,
  updated_at = NOW()
WHERE user_id = 'f721d67a-1f37-4709-92a9-ede89e77717f'; -- jadiel

UPDATE profiles 
SET 
  balance = 158.25,
  total_profit = 8.25,
  updated_at = NOW()
WHERE user_id = '8072bfbd-b404-47e7-9a48-af43eba3ce70'; -- LECi

UPDATE profiles 
SET 
  balance = 105.50,
  total_profit = 5.50,
  updated_at = NOW()
WHERE user_id = '22ed9e11-fc5f-4a87-8e34-67c8ae073c73'; -- teste hugo

-- Criar dados de comissão na tabela referrals baseado nos lucros dos indicados
UPDATE referrals 
SET total_commission = 1.58 -- 10% de 15.75
WHERE referrer_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944' 
AND referred_id = 'f721d67a-1f37-4709-92a9-ede89e77717f';

UPDATE referrals 
SET total_commission = 0.83 -- 10% de 8.25
WHERE referrer_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944' 
AND referred_id = '8072bfbd-b404-47e7-9a48-af43eba3ce70';

UPDATE referrals 
SET total_commission = 0.55 -- 10% de 5.50
WHERE referrer_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944' 
AND referred_id = '22ed9e11-fc5f-4a87-8e34-67c8ae073c73';

-- Criar alguns trading profits para mostrar atividade
INSERT INTO trading_profits (
  user_id,
  plan_name,
  investment_amount,
  total_profit,
  daily_rate,
  completed_operations,
  exchanges_count,
  execution_time_seconds,
  status
) VALUES 
('f721d67a-1f37-4709-92a9-ede89e77717f', 'Robô 4.0.0', 250.00, 15.75, 0.025, 6, 2, 3600, 'completed'),
('8072bfbd-b404-47e7-9a48-af43eba3ce70', 'Robô 4.0.0', 150.00, 8.25, 0.025, 4, 2, 2400, 'completed'),
('22ed9e11-fc5f-4a87-8e34-67c8ae073c73', 'Robô 4.0.0', 100.00, 5.50, 0.025, 3, 2, 1800, 'completed');