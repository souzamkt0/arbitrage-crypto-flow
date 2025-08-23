-- Criar dados de exemplo para trading_history com tipo correto
INSERT INTO trading_history (
  user_id,
  operation_id,
  pair,
  type,
  buy_price,
  sell_price,
  amount,
  profit,
  profit_percent,
  status,
  exchange_1,
  exchange_2,
  execution_time,
  created_at
) VALUES 
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'BTC/USDT',
  'arbitrage',
  42350.80,
  42485.90,
  100.00,
  15.25,
  2.85,
  'completed',
  'Binance Spot',
  'Binance Futures',
  45,
  NOW() - interval '2 hours'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'ETH/USDT',
  'arbitrage',
  2285.40,
  2297.80,
  150.00,
  22.40,
  3.20,
  'completed',
  'Binance Spot',
  'Binance Futures',
  38,
  NOW() - interval '4 hours'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'SOL/USDT',
  'arbitrage',
  98.75,
  99.90,
  80.00,
  8.50,
  2.95,
  'completed',
  'Binance Spot',
  'Binance Futures',
  52,
  NOW() - interval '6 hours'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'ADA/USDT',
  'arbitrage',
  0.4250,
  0.4285,
  200.00,
  12.80,
  3.10,
  'completed',
  'Binance Spot',
  'Binance Futures',
  41,
  NOW() - interval '8 hours'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'BNB/USDT',
  'arbitrage',
  315.20,
  318.50,
  60.00,
  9.75,
  2.75,
  'completed',
  'Binance Spot',
  'Binance Futures',
  35,
  NOW() - interval '10 hours'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'MATIC/USDT',
  'scalping',
  0.8750,
  0.8825,
  120.00,
  6.85,
  2.65,
  'completed',
  'Binance Spot',
  'Binance Futures',
  28,
  NOW() - interval '12 hours'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  'OP-' || substr(gen_random_uuid()::text, 1, 8),
  'DOT/USDT',
  'grid',
  5.25,
  5.35,
  90.00,
  11.20,
  3.45,
  'completed',
  'Binance Spot',
  'Binance Futures',
  62,
  NOW() - interval '14 hours'
);

-- Criar dados de exemplo para trading_profits
INSERT INTO trading_profits (
  user_id,
  investment_amount,
  daily_rate,
  plan_name,
  total_profit,
  completed_operations,
  exchanges_count,
  execution_time_seconds,
  status,
  created_at
) VALUES 
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  500.00,
  2.50,
  'Plano Professional',
  125.50,
  45,
  8,
  1800,
  'completed',
  NOW() - interval '1 day'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  300.00,
  2.80,
  'Plano Advanced',
  84.30,
  32,
  6,
  1200,
  'completed',
  NOW() - interval '2 days'
),
(
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  800.00,
  2.65,
  'Plano Premium',
  212.40,
  67,
  12,
  2400,
  'completed',
  NOW() - interval '3 days'
);

-- Criar planos de investimento se não existirem
INSERT INTO investment_plans (
  name,
  robot_version,
  minimum_amount,
  minimum_indicators,
  daily_rate,
  duration_days,
  description,
  status
) VALUES 
(
  'Plano Starter',
  '4.0.0',
  100,
  0,
  2.30,
  30,
  'Plano inicial para novos investidores',
  'active'
),
(
  'Plano Professional',
  '4.0.0',
  500,
  5,
  2.50,
  45,
  'Plano para investidores experientes',
  'active'
),
(
  'Plano Premium',
  '4.1.0',
  1000,
  10,
  2.80,
  60,
  'Plano premium com máximo retorno',
  'active'
)
ON CONFLICT (name) DO NOTHING;

-- Criar um investimento ativo para o usuário
INSERT INTO user_investments (
  user_id,
  plan_id,
  amount,
  daily_rate,
  end_date,
  total_operations,
  operations_completed,
  total_earned,
  today_earnings,
  current_day_progress,
  status
) VALUES (
  '3df866ff-b7f7-4f56-9690-d12ff9c10944',
  (SELECT id FROM investment_plans WHERE name = 'Plano Professional' LIMIT 1),
  500.00,
  2.50,
  NOW() + interval '30 days',
  150,
  45,
  125.50,
  12.75,
  85.5,
  'active'
);